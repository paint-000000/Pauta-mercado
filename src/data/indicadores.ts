import type { Fonte, Indicador } from "@/types";
import { gerarSerie } from "@/lib/serie";

/**
 * ⚠️  DADOS DE PROTÓTIPO
 *
 * Os nomes são reais — Ibovespa, S&P 500, Selic existem e não há nada
 * a inventar sobre eles. Os NÚMEROS são fictícios e plausíveis, e o
 * app mostra tarja permanente por causa disso.
 *
 * A fonte de cada um já está declarada apontando para quem publica o
 * dado de verdade, porque é ela que a Fase de integração vai consultar:
 * Banco Central (Selic, câmbio), IBGE (IPCA), B3 (Ibovespa).
 */

const HOJE = "2026-08-18T18:20:00-03:00";

const f = (nome: string, url?: string): Fonte => ({
  nome,
  url,
  publicadoEm: HOJE,
});

type Base = Omit<Indicador, "serie" | "natureza">;

const base: Base[] = [
  {
    id: "ibovespa",
    nome: "Ibovespa",
    sigla: "IBOV",
    classe: "indice",
    valor: 138420,
    casas: 0,
    sufixo: " pts",
    variacao: 1104,
    variacaoPct: 0.8,
    direcao: "alta",
    referencia: "fechamento",
    explicacao:
      "Principal índice da bolsa brasileira. Acompanha as [[acao|ações]] mais negociadas da [[b3]].",
    fontes: [f("B3", "https://www.b3.com.br")],
  },
  {
    id: "sp500",
    nome: "S&P 500",
    sigla: "SPX",
    classe: "indice",
    valor: 6284,
    casas: 0,
    sufixo: " pts",
    variacao: 21.6,
    variacaoPct: 0.34,
    direcao: "alta",
    referencia: "fechamento",
    explicacao:
      "Reúne as 500 maiores empresas listadas nos Estados Unidos. É a referência global de bolsa.",
    fontes: [f("Reuters")],
  },
  {
    id: "nasdaq",
    nome: "Nasdaq",
    sigla: "IXIC",
    classe: "indice",
    valor: 21106,
    casas: 0,
    sufixo: " pts",
    variacao: -84.2,
    variacaoPct: -0.4,
    direcao: "baixa",
    referencia: "fechamento",
    explicacao:
      "Índice concentrado em empresas de tecnologia. Costuma oscilar mais que o [[sp500]].",
    fontes: [f("Reuters")],
  },
  {
    id: "dolar",
    nome: "Dólar",
    sigla: "USD",
    classe: "moeda",
    valor: 5.38,
    casas: 2,
    prefixo: "R$ ",
    variacao: -0.021,
    variacaoPct: -0.39,
    direcao: "baixa",
    referencia: "comercial",
    explicacao:
      "Quanto custa um dólar em reais. Afeta o preço de tudo que o país importa e, por isso, a [[inflacao]].",
    fontes: [f("Banco Central", "https://www.bcb.gov.br")],
  },
  {
    id: "bitcoin",
    nome: "Bitcoin",
    sigla: "BTC",
    classe: "cripto",
    valor: 618400,
    casas: 0,
    prefixo: "R$ ",
    variacao: 12800,
    variacaoPct: 2.11,
    direcao: "alta",
    referencia: "24 h",
    explicacao:
      "Criptomoeda de maior valor de mercado. Oscila muito mais que índices de bolsa.",
    fontes: [f("Reuters")],
  },
  {
    id: "selic",
    nome: "Selic",
    sigla: "SELIC",
    classe: "juro",
    valor: 10.5,
    casas: 2,
    sufixo: "%",
    variacao: 0,
    variacaoPct: 0,
    direcao: "estavel",
    referencia: "ao ano",
    explicacao:
      "Taxa básica de juros do país, definida pelo [[copom]]. Serve de referência para quase todo o resto.",
    fontes: [f("Banco Central", "https://www.bcb.gov.br")],
  },
  {
    id: "ipca",
    nome: "IPCA",
    sigla: "IPCA",
    classe: "inflacao",
    valor: 4.12,
    casas: 2,
    sufixo: "%",
    variacao: -0.09,
    variacaoPct: -2.14,
    direcao: "baixa",
    referencia: "12 meses",
    explicacao:
      "Índice oficial de [[inflacao]]. É a régua mínima que um investimento precisa superar.",
    fontes: [f("IBGE", "https://www.ibge.gov.br")],
  },
  {
    id: "di",
    nome: "DI 1 ano",
    sigla: "DI1F27",
    classe: "juro",
    valor: 10.72,
    casas: 2,
    sufixo: "%",
    variacao: 0.06,
    variacaoPct: 0.56,
    direcao: "alta",
    referencia: "ao ano",
    explicacao:
      "Juro futuro negociado na [[b3]]. Mostra o que o mercado espera da [[selic]] daqui para a frente.",
    fontes: [f("B3", "https://www.b3.com.br")],
  },
];

export const indicadores: Indicador[] = base.map((b) => ({
  ...b,
  natureza: "exemplo",
  serie: gerarSerie(b.id, b.valor, b.variacaoPct),
}));

const porId = new Map(indicadores.map((i) => [i.id, i]));

export function getIndicador(id: string): Indicador | undefined {
  return porId.get(id);
}

/** Os que entram na faixa de cotações do topo. */
export const NA_FAIXA = [
  "ibovespa",
  "sp500",
  "nasdaq",
  "dolar",
  "bitcoin",
  "selic",
  "ipca",
  "di",
];

/** Os que abrem a home, em ordem de relevância editorial. */
export const NO_HERO = [
  "ibovespa",
  "sp500",
  "nasdaq",
  "dolar",
  "bitcoin",
  "selic",
  "ipca",
  "di",
];
