/**
 * BANCO CENTRAL — SÉRIES TEMPORAIS (SGS)
 *
 * A fonte mais confiável do conjunto e a única sem chave: é serviço
 * público, aberto, sem cadastro e sem limite prático de uso. Selic,
 * IPCA e câmbio saem daqui, e é por isso que o produto pode prometer
 * atualização diária sem depender de contrato com ninguém.
 *
 * O formato do SGS tem três armadilhas, todas tratadas abaixo:
 *
 *   1. A data vem em dd/MM/yyyy, não ISO.
 *   2. O valor vem como string.
 *   3. Algumas séries publicam o FUTURO, e uma delas é a principal.
 *      A 432 é a META Selic, repetida todo dia até o próximo Copom:
 *      pedir os últimos 20 pontos devolve vinte datas que ainda não
 *      chegaram. Publicar isso poria "apurado em 16/09" numa página
 *      do dia 20/08 — observação que não aconteceu. Por isso a busca
 *      é por INTERVALO terminando hoje, e não por `/ultimos/N`.
 *   4. Erro de negócio volta com HTTP 200 e corpo `{"erro": {...}}`.
 *      Esta é a que morde: `response.ok` é verdadeiro, o código segue
 *      como se tivesse dado certo, e o problema só aparece bem
 *      adiante disfarçado de "série vazia" — apontando para o lugar
 *      errado. Por isso o envelope é inspecionado antes de qualquer
 *      outra coisa.
 */

import type { Fonte } from "@/types";
import { buscar, numero, type Leitura, type ResultadoFonte } from "@/lib/fontes/tipos";

const RAIZ = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

/**
 * Séries usadas. O código do SGS é a chave primária do Banco Central
 * e não muda — é seguro deixá-lo fixo aqui.
 */
/**
 * `janelaDias` é quanto se olha para trás para juntar pontos
 * suficientes. Série diária precisa de poucas semanas; série mensal
 * precisa de anos para encher o mesmo sparkline.
 */
const SERIES = {
  /** Meta Selic definida pelo Copom, % a.a. */
  selic: { codigo: 432, id: "selic", janelaDias: 120 },
  /** IPCA acumulado em 12 meses, %. */
  ipca: { codigo: 13522, id: "ipca", janelaDias: 800 },
  /** Dólar de venda, R$. */
  dolar: { codigo: 1, id: "dolar", janelaDias: 60 },
} as const;

/** Pontos guardados para o sparkline. */
const PONTOS_SERIE = 30;

/** dd/MM/yyyy, que é o formato que o SGS aceita no filtro. */
function paraBR(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

type LinhaSGS = { data: string; valor: string };

/** dd/MM/yyyy → ISO. O SGS não publica hora; fica meio-dia local. */
function paraISO(ddmmyyyy: string): string {
  const [d, m, a] = ddmmyyyy.split("/");
  return `${a}-${m}-${d}T12:00:00-03:00`;
}

/**
 * O erro que veio disfarçado de sucesso.
 *
 * Devolve a mensagem do Banco Central quando o corpo é um envelope
 * de erro, e `null` quando a resposta é legítima.
 */
function erroEmbutido(bruto: unknown): string | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const e = (bruto as { erro?: { detail?: unknown; statusCode?: unknown } }).erro;
  if (!e) return null;

  const detalhe = typeof e.detail === "string" ? e.detail : JSON.stringify(e);
  // A exceção Java vem com o pacote inteiro na frente; o que importa
  // para quem lê o log do CI é a frase depois dos dois-pontos.
  return detalhe.split(": ").slice(-1)[0] || detalhe;
}

function ehLinha(x: unknown): x is LinhaSGS {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as LinhaSGS).data === "string" &&
    typeof (x as LinhaSGS).valor === "string"
  );
}

function fonteBcb(publicadoEm: string): Fonte {
  return {
    nome: "Banco Central",
    url: "https://www.bcb.gov.br",
    publicadoEm,
  };
}

export async function lerBancoCentral(): Promise<ResultadoFonte> {
  const leituras: Leitura[] = [];

  try {
    const hoje = new Date();

    for (const { codigo, id, janelaDias } of Object.values(SERIES)) {
      const inicio = new Date(hoje.getTime() - janelaDias * 86_400_000);
      const bruto = await buscar(
        `${RAIZ}.${codigo}/dados?formato=json` +
          `&dataInicial=${paraBR(inicio)}&dataFinal=${paraBR(hoje)}`,
      );

      const embutido = erroEmbutido(bruto);
      if (embutido) {
        return { ok: false, erro: `série ${codigo}: ${embutido}` };
      }

      if (!Array.isArray(bruto) || bruto.length === 0) {
        return { ok: false, erro: `série ${codigo} veio vazia` };
      }

      // O intervalo já termina hoje, mas o filtro fica: é barato, e
      // é a única defesa se uma série passar a publicar adiantada.
      const agora = Date.now();
      const linhas = bruto
        .filter(ehLinha)
        .filter((l) => new Date(paraISO(l.data)).getTime() <= agora);

      if (linhas.length === 0) {
        return { ok: false, erro: `série ${codigo} só tem datas futuras` };
      }
      const serie = linhas
        .map((l) => numero(l.valor))
        .filter((n): n is number => n !== null)
        .slice(-PONTOS_SERIE);

      if (serie.length === 0) {
        return { ok: false, erro: `série ${codigo} sem valor numérico` };
      }

      const valor = serie[serie.length - 1];
      const anterior = serie.length > 1 ? serie[serie.length - 2] : valor;
      const ultima = linhas[linhas.length - 1];

      leituras.push({
        id,
        valor,
        variacao: valor - anterior,
        // Selic e IPCA já são percentuais: variar de 14,00 para 14,25
        // é 0,25 ponto, não 1,8%. Quem consome decide como exibir; o
        // adaptador entrega os dois e não escolhe por ele.
        variacaoPct: anterior === 0 ? 0 : ((valor - anterior) / anterior) * 100,
        apuradoEm: paraISO(ultima.data),
        fonte: fonteBcb(paraISO(ultima.data)),
        serie,
      });
    }

    return { ok: true, leituras };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}
