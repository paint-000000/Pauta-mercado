/**
 * INGESTÃO — CONTRATO COMUM DAS FONTES
 *
 * Este diretório é a única parte do sistema que fala com a internet,
 * e ele roda no CI, nunca no navegador do leitor. O site continua
 * export estático: a diferença é que agora o conteúdo de `src/data`
 * é reescrito uma vez por dia antes do build, em vez de ser digitado
 * à mão uma vez e congelado.
 *
 * Três regras que todo adaptador respeita:
 *
 *   1. Falhar não derruba o site. Uma fonte fora do ar devolve
 *      `erro`, o orquestrador mantém o último valor bom, e a página
 *      diz que aquele número está velho. Nunca some, nunca mente.
 *
 *   2. Nada é publicado sem procedência. O tipo `Fonte` do domínio
 *      já obriga isso; aqui o adaptador é obrigado a preencher com o
 *      órgão que realmente publicou, não com "internet".
 *
 *   3. Adaptador não interpreta. Ele converte formato e nada mais.
 *      Nenhum adaptador decide se um número é bom ou ruim — isso é
 *      a camada de análise, e ela não pode nascer de um JSON.
 */

import type { Fonte } from "@/types";

/** Uma leitura de fonte primária, já normalizada. */
export type Leitura = {
  /** Identificador estável, usado para casar com o dado existente. */
  id: string;
  valor: number;
  /** Variação absoluta desde a leitura anterior, quando a fonte dá. */
  variacao?: number;
  variacaoPct?: number;
  /** Quando o dado foi apurado pela fonte, não quando foi baixado. */
  apuradoEm: string;
  fonte: Fonte;
  /** Série histórica curta, quando a fonte oferece. */
  serie?: number[];
};

/** Como o valor chegou até aqui na última rodada. */
export type EstadoDado = "novo" | "mantido" | "velho";

export type Registro = Leitura & { estado: EstadoDado };

/**
 * O que o robô diário escreve e o site lê.
 *
 * É um módulo TypeScript gerado, não um JSON, por um motivo prático:
 * importar JSON exige `with { type: "json" }` no Node e nada disso no
 * bundler, então o mesmo arquivo se comportaria diferente no teste e
 * na página. Um `.ts` gerado é idêntico nos dois, e ainda passa pelo
 * compilador — dado gerado com campo faltando vira erro de build, e
 * não buraco na tela.
 */
export type Manifesto = {
  /** Quando o robô rodou. Diferente de quando o dado foi apurado. */
  rodadoEm: string;
  fontes: { nome: string; ok: boolean; erro?: string }[];
  dados: Record<string, Registro>;
};

export type ResultadoFonte =
  | { ok: true; leituras: Leitura[] }
  | { ok: false; erro: string };

/**
 * `fetch` com prazo e uma repetição.
 *
 * Sem prazo, um endpoint pendurado trava o workflow até o limite do
 * runner. Uma repetição só: se a segunda também falhar, o problema
 * não é intermitência e insistir só atrasa o build — o orquestrador
 * já sabe manter o valor anterior.
 */
export async function buscar(
  url: string,
  opcoes: { prazoMs?: number; cabecalhos?: Record<string, string> } = {},
): Promise<unknown> {
  const { prazoMs = 20_000, cabecalhos = {} } = opcoes;

  let ultimoErro: unknown;

  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const abortar = new AbortController();
    const relogio = setTimeout(() => abortar.abort(), prazoMs);

    try {
      const r = await fetch(url, {
        signal: abortar.signal,
        headers: { "User-Agent": "pauta-mercado/1.0 (+github actions)", ...cabecalhos },
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      ultimoErro = e;
    } finally {
      clearTimeout(relogio);
    }
  }

  throw ultimoErro instanceof Error ? ultimoErro : new Error(String(ultimoErro));
}

/**
 * Aceita um número vindo de JSON de terceiro.
 *
 * APIs devolvem número como string, string vazia, `null` e às vezes
 * `NaN` serializado. Um `Number(x)` solto transforma tudo isso em
 * `NaN` e o `NaN` chega ao gráfico como buraco silencioso. Aqui ele
 * vira `null` e o chamador é obrigado a decidir o que fazer.
 */
export function numero(x: unknown): number | null {
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  if (typeof x === "string" && x.trim() !== "") {
    const n = Number(x.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
