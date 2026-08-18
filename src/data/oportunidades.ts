import type { Fonte } from "@/types";
import type { ClasseSim } from "@/lib/simulador";

/**
 * ⚠️  TAXAS E PREÇOS SÃO DE PROTÓTIPO.
 *
 * Os NOMES dos títulos públicos são reais — "Tesouro IPCA+ 2035" é um
 * produto padronizado do governo, não uma análise sobre uma empresa.
 * Mostrá-lo aqui é equivalente a mostrar "Selic" ou "Ibovespa": nome
 * público, número fictício, tarja no site.
 *
 * ETFs, FIIs e ações seguem com tickers sintéticos, pela mesma razão
 * de sempre: atrelar uma tese inventada a uma companhia real é o
 * artefato que este produto existe para não produzir.
 *
 * Isto é o que fecha o ciclo do simulador. Terminar em "título
 * atrelado à inflação" deixa o leitor exatamente onde ele começou —
 * sabendo a categoria e sem saber o que existe dentro dela.
 */

export type NivelRisco = "baixo" | "medio" | "alto";

export type Oportunidade = {
  id: string;
  classe: ClasseSim;
  nome: string;
  emissor: string;
  /** O número que importa nesta classe: taxa, yield, variação. */
  indicador: string;
  indicadorRotulo: string;
  vencimento?: string;
  /** Em reais. Usado para filtrar o que cabe na fatia. */
  minimo: number;
  liquidez: string;
  risco: NivelRisco;
  /** Por que este e não os outros da mesma classe. Uma frase. */
  destaque: string;
  /** A ressalva. Nunca opcional na prática — toda escolha tem uma. */
  observacao: string;
  /** Prazo em anos, para ordenar por aderência ao horizonte. */
  prazoAnos: number;
  ticker?: string;
  fontes: Fonte[];
};

const HOJE = "2026-08-18T18:20:00-03:00";
const f = (nome: string, url?: string): Fonte => ({ nome, url, publicadoEm: HOJE });

const TESOURO = f("Tesouro Direto", "https://www.tesourodireto.com.br");
const B3 = f("B3", "https://www.b3.com.br");
const PROTO = f("Dados de protótipo");

export const oportunidades: Oportunidade[] = [
  /* ============ Reserva / liquidez diária ============ */
  {
    id: "tesouro-selic-2029",
    classe: "reserva",
    nome: "Tesouro Selic 2029",
    emissor: "Tesouro Nacional",
    indicador: "SELIC + 0,04%",
    indicadorRotulo: "Rendimento",
    vencimento: "01/03/2029",
    minimo: 152.4,
    liquidez: "Diária (D+1)",
    risco: "baixo",
    prazoAnos: 2.5,
    destaque:
      "O menor risco de crédito do país com resgate em um dia útil. É o padrão de reserva.",
    observacao:
      "O rendimento acompanha a Selic: se ela cair, ele cai junto no mesmo dia.",
    fontes: [TESOURO],
  },
  {
    id: "tesouro-selic-2031",
    classe: "reserva",
    nome: "Tesouro Selic 2031",
    emissor: "Tesouro Nacional",
    indicador: "SELIC + 0,12%",
    indicadorRotulo: "Rendimento",
    vencimento: "01/03/2031",
    minimo: 148.9,
    liquidez: "Diária (D+1)",
    risco: "baixo",
    prazoAnos: 4.5,
    destaque:
      "Paga um pouco acima do vencimento mais curto, com a mesma liquidez diária.",
    observacao:
      "A diferença de rendimento é pequena — não vale travar planejamento por causa dela.",
    fontes: [TESOURO],
  },
  {
    id: "cdb-liquidez-diaria",
    classe: "reserva",
    nome: "CDB de liquidez diária",
    emissor: "Banco (categoria)",
    indicador: "100% a 105% do CDI",
    indicadorRotulo: "Rendimento",
    minimo: 100,
    liquidez: "Diária",
    risco: "baixo",
    prazoAnos: 1,
    destaque:
      "Costuma render um pouco acima do Tesouro Selic e tem cobertura do FGC até o limite.",
    observacao:
      "Depende da saúde do banco emissor. Acima do teto do FGC, o risco é seu.",
    fontes: [PROTO],
  },

  /* ============ Título atrelado à inflação ============ */
  {
    id: "tesouro-ipca-2029",
    classe: "tesouro-ipca",
    nome: "Tesouro IPCA+ 2029",
    emissor: "Tesouro Nacional",
    indicador: "IPCA + 6,18%",
    indicadorRotulo: "Taxa real",
    vencimento: "15/05/2029",
    minimo: 41.7,
    liquidez: "Diária (D+1)",
    risco: "baixo",
    prazoAnos: 2.7,
    destaque:
      "O vencimento mais curto da família. Menos oscilação de preço até o vencimento.",
    observacao:
      "Taxa menor que os longos, e você precisa reinvestir em 2029 sabe-se lá a que taxa.",
    fontes: [TESOURO],
  },
  {
    id: "tesouro-ipca-2035",
    classe: "tesouro-ipca",
    nome: "Tesouro IPCA+ 2035",
    emissor: "Tesouro Nacional",
    indicador: "IPCA + 6,42%",
    indicadorRotulo: "Taxa real",
    vencimento: "15/05/2035",
    minimo: 32.1,
    liquidez: "Diária (D+1)",
    risco: "baixo",
    prazoAnos: 8.7,
    destaque:
      "Equilíbrio entre prazo e taxa. É o vencimento mais negociado da família.",
    observacao:
      "Duration alta: uma alta de 1% no juro derruba o preço em cerca de 7% se precisar vender antes.",
    ticker: "TESOURO-IPCA-2035",
    fontes: [TESOURO],
  },
  {
    id: "tesouro-ipca-2045",
    classe: "tesouro-ipca",
    nome: "Tesouro IPCA+ 2045",
    emissor: "Tesouro Nacional",
    indicador: "IPCA + 6,55%",
    indicadorRotulo: "Taxa real",
    vencimento: "15/05/2045",
    minimo: 28.4,
    liquidez: "Diária (D+1)",
    risco: "baixo",
    prazoAnos: 18.7,
    destaque:
      "A maior taxa real da família. Trava o ganho acima da inflação por quase vinte anos.",
    observacao:
      "É o que mais oscila de preço no caminho. Só faz sentido se for para carregar até o fim.",
    fontes: [TESOURO],
  },
  {
    id: "tesouro-ipca-juros-2035",
    classe: "tesouro-ipca",
    nome: "Tesouro IPCA+ com Juros Semestrais 2035",
    emissor: "Tesouro Nacional",
    indicador: "IPCA + 6,28%",
    indicadorRotulo: "Taxa real",
    vencimento: "15/05/2035",
    minimo: 45.8,
    liquidez: "Diária (D+1)",
    risco: "baixo",
    prazoAnos: 8.7,
    destaque:
      "Paga juros a cada seis meses em vez de tudo no fim. Serve para quem quer renda no caminho.",
    observacao:
      "Cada pagamento semestral tem imposto na hora, o que reduz o efeito de juros compostos.",
    fontes: [TESOURO],
  },

  /* ============ ETF de índice brasileiro ============ */
  {
    id: "etfi11",
    classe: "etf-brasil",
    nome: "ETF Índice Brasil",
    emissor: "ETFI11",
    indicador: "R$ 132,48",
    indicadorRotulo: "Cota",
    minimo: 132.48,
    liquidez: "Alta (D+2)",
    risco: "medio",
    prazoAnos: 10,
    destaque:
      "Replica o Ibovespa. Uma compra expõe você às maiores empresas da bolsa brasileira.",
    observacao:
      "Herda a concentração do índice em commodities e bancos — não é tão diversificado quanto parece.",
    ticker: "ETFI11",
    fontes: [B3],
  },
  {
    id: "etfs11",
    classe: "etf-brasil",
    nome: "ETF Small Caps Brasil",
    emissor: "ETFS11",
    indicador: "R$ 88,20",
    indicadorRotulo: "Cota",
    minimo: 88.2,
    liquidez: "Média (D+2)",
    risco: "alto",
    prazoAnos: 10,
    destaque:
      "Empresas menores, fora do índice principal. Historicamente reage mais forte a ciclos de corte de juros.",
    observacao:
      "Oscila bem mais que o índice cheio e tem menos liquidez para sair em momento ruim.",
    fontes: [PROTO],
  },

  /* ============ ETF internacional ============ */
  {
    id: "extr11",
    classe: "etf-exterior",
    nome: "ETF Exterior Desenvolvidos",
    emissor: "EXTR11",
    indicador: "R$ 98,15",
    indicadorRotulo: "Cota",
    minimo: 98.15,
    liquidez: "Alta (D+2)",
    risco: "medio",
    prazoAnos: 10,
    destaque:
      "Empresas de 23 países desenvolvidos, comprado aqui em reais e sem conta no exterior.",
    observacao:
      "Sem proteção cambial: real forte corrói o retorno mesmo com a bolsa lá subindo.",
    ticker: "EXTR11",
    fontes: [B3],
  },
  {
    id: "extu11",
    classe: "etf-exterior",
    nome: "ETF S&P 500",
    emissor: "EXTU11",
    indicador: "R$ 412,60",
    indicadorRotulo: "Cota",
    minimo: 412.6,
    liquidez: "Alta (D+2)",
    risco: "medio",
    prazoAnos: 10,
    destaque:
      "Concentrado nas 500 maiores empresas americanas. É a exposição internacional mais direta.",
    observacao:
      "Um único país e uma única moeda. Menos diversificado que um ETF global.",
    fontes: [PROTO],
  },

  /* ============ Fundo imobiliário ============ */
  {
    id: "mrda11",
    classe: "fii",
    nome: "Merídia Renda Urbana",
    emissor: "MRDA11",
    indicador: "9,4% a.a.",
    indicadorRotulo: "Dividend yield",
    minimo: 104.7,
    liquidez: "Média (D+2)",
    risco: "medio",
    prazoAnos: 10,
    destaque:
      "Galpões logísticos com contratos longos. Paga rendimento todo mês.",
    observacao:
      "Concentrado em poucos inquilinos — a saída de um pesa bastante no rendimento.",
    ticker: "MRDA11",
    fontes: [PROTO],
  },
  {
    id: "fipl11",
    classe: "fii",
    nome: "Fundo de Papel Indexado",
    emissor: "FIPL11",
    indicador: "11,2% a.a.",
    indicadorRotulo: "Dividend yield",
    minimo: 96.3,
    liquidez: "Média (D+2)",
    risco: "medio",
    prazoAnos: 6,
    destaque:
      "Investe em dívida imobiliária corrigida pela inflação, não em imóvel físico. Não tem vacância.",
    observacao:
      "Troca o risco de vacância pelo risco de crédito de quem tomou o empréstimo.",
    fontes: [PROTO],
  },

  /* ============ Ações ============ */
  {
    id: "nrte3",
    classe: "acoes",
    nome: "Norte Logística",
    emissor: "NRTE3",
    indicador: "R$ 27,84",
    indicadorRotulo: "Cotação",
    minimo: 27.84,
    liquidez: "Alta (D+2)",
    risco: "alto",
    prazoAnos: 10,
    destaque:
      "Empresa fictícia do protótipo. Logística para varejo, com margem em expansão.",
    observacao:
      "Ação individual pode cair muito mais que o índice. Exige acompanhar a empresa.",
    ticker: "NRTE3",
    fontes: [PROTO],
  },
  {
    id: "vlcm3",
    classe: "acoes",
    nome: "Volcame Energia",
    emissor: "VLCM3",
    indicador: "R$ 41,20",
    indicadorRotulo: "Cotação",
    minimo: 41.2,
    liquidez: "Alta (D+2)",
    risco: "alto",
    prazoAnos: 10,
    destaque:
      "Empresa fictícia do protótipo. Receita regulada, mas alavancagem subindo há quatro trimestres.",
    observacao:
      "Está classificada como cautela no radar. Aparece aqui para comparação, não como sugestão.",
    ticker: "VLCM3",
    fontes: [PROTO],
  },
];

/**
 * Oportunidades de uma classe, ordenadas por aderência.
 *
 * Dois critérios, nesta ordem: cabe na fatia (o mínimo de aplicação é
 * menor que o valor destinado) e prazo mais próximo do horizonte do
 * usuário. O que não cabe vai para o fim, mas continua visível — saber
 * que existe e ainda não dá é informação, sumir com o item não é.
 */
export function oportunidadesDaClasse(
  classe: ClasseSim,
  valorFatia: number,
  horizonteAnos: number,
): { item: Oportunidade; cabe: boolean }[] {
  return oportunidades
    .filter((o) => o.classe === classe)
    .map((item) => ({ item, cabe: item.minimo <= valorFatia }))
    .sort((a, b) => {
      if (a.cabe !== b.cabe) return a.cabe ? -1 : 1;
      return (
        Math.abs(a.item.prazoAnos - horizonteAnos) -
        Math.abs(b.item.prazoAnos - horizonteAnos)
      );
    });
}

export const ROTULO_RISCO_OP: Record<NivelRisco, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
};
