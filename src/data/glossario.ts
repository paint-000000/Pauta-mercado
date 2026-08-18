import type { Termo } from "@/types";

/**
 * O glossário é transversal, não é uma seção.
 *
 * Regra: qualquer termo técnico que apareça em QUALQUER texto do site
 * precisa existir aqui. `lib/validacao.ts` varre todo o conteúdo e
 * falha se encontrar um `[[termo]]` órfão — inclusive dentro dos
 * rótulos de indicador das páginas de ativo, que é onde jargão como
 * "EV/EBITDA" e "duration" entra sem pedir licença.
 *
 * Definições curtas de verdade. Quem está lendo isso parou no meio de
 * outra frase e quer voltar para ela.
 */
export const termos: Termo[] = [
  /* -------- Macro -------- */
  {
    slug: "selic",
    termo: "Selic",
    definicaoCurta:
      "É a taxa básica de juros do Brasil. Serve de referência para quase todos os outros juros do país.",
    exemplo: "Com a Selic alta, deixar dinheiro em renda fixa rende mais.",
    porQueImporta:
      "É o número que mais mexe com o que faz sentido investir num dado momento.",
    relacionados: ["cdi", "copom", "renda-fixa", "di"],
  },
  {
    slug: "cdi",
    termo: "CDI",
    definicaoCurta:
      "Taxa que anda quase colada na Selic. Muitos investimentos prometem render uma porcentagem dela.",
    exemplo: '"100% do CDI" significa acompanhar essa taxa de perto.',
    relacionados: ["selic", "renda-fixa"],
  },
  {
    slug: "di",
    termo: "DI futuro",
    definicaoCurta:
      "Contrato negociado na bolsa que mostra qual juro o mercado espera para uma data futura.",
    porQueImporta:
      "É o termômetro mais rápido da expectativa: reage antes mesmo de o Banco Central se reunir.",
    relacionados: ["selic", "copom", "b3"],
  },
  {
    slug: "ipca",
    termo: "IPCA",
    definicaoCurta:
      "Índice oficial de inflação — quanto os preços subiram, em média, no período.",
    porQueImporta:
      "Um investimento só ganha poder de compra se render acima dele.",
    relacionados: ["inflacao", "renda-fixa"],
  },
  {
    slug: "inflacao",
    termo: "inflação",
    definicaoCurta:
      "Aumento geral dos preços ao longo do tempo. Faz o mesmo dinheiro comprar menos coisas.",
    relacionados: ["ipca", "selic"],
  },
  {
    slug: "copom",
    termo: "Copom",
    definicaoCurta:
      "Grupo do Banco Central que se reúne a cada 45 dias para decidir a Selic.",
    relacionados: ["selic", "di"],
  },

  /* -------- Mercados -------- */
  {
    slug: "ibovespa",
    termo: "Ibovespa",
    definicaoCurta:
      "Principal termômetro da bolsa brasileira. Acompanha as ações mais negociadas do país.",
    exemplo: '"A bolsa subiu" quase sempre quer dizer que o Ibovespa subiu.',
    relacionados: ["acao", "b3", "etf"],
  },
  {
    slug: "sp500",
    termo: "S&P 500",
    definicaoCurta:
      "Índice das 500 maiores empresas listadas nos Estados Unidos. É a referência global de bolsa.",
    relacionados: ["ibovespa", "etf"],
  },
  {
    slug: "b3",
    termo: "B3",
    definicaoCurta:
      "A bolsa de valores brasileira — onde ações, ETFs e fundos imobiliários são negociados.",
    relacionados: ["acao", "cvm", "ibovespa"],
  },
  {
    slug: "cvm",
    termo: "CVM",
    definicaoCurta:
      "Órgão do governo que fiscaliza o mercado de investimentos no Brasil.",
    relacionados: ["b3", "oferta-publica"],
  },

  /* -------- Classes -------- */
  {
    slug: "renda-fixa",
    termo: "renda fixa",
    definicaoCurta:
      "Investimentos em que você sabe desde o início como o rendimento é calculado. O tipo mais previsível.",
    exemplo: "Tesouro Direto e CDB são renda fixa.",
    relacionados: ["renda-variavel", "tesouro-direto", "liquidez"],
  },
  {
    slug: "renda-variavel",
    termo: "renda variável",
    definicaoCurta:
      "Investimentos cujo valor sobe e desce sem previsão. Podem render mais, e também dar prejuízo.",
    relacionados: ["renda-fixa", "acao", "volatilidade"],
  },
  {
    slug: "tesouro-direto",
    termo: "Tesouro Direto",
    definicaoCurta:
      "Programa para comprar títulos do governo federal. É o investimento de menor risco de crédito do país.",
    relacionados: ["renda-fixa", "ipca", "duration"],
  },
  {
    slug: "acao",
    termo: "ação",
    definicaoCurta:
      "Um pedacinho de uma empresa. Comprando uma, você vira sócio — dos lucros e dos prejuízos.",
    relacionados: ["renda-variavel", "dividendos", "b3", "p-l"],
  },
  {
    slug: "etf",
    termo: "ETF",
    definicaoCurta:
      "Investimento único que reúne vários ativos. Com uma compra você fica exposto a dezenas de empresas.",
    exemplo: "Um ETF de Ibovespa espalha o dinheiro pelas maiores empresas da bolsa.",
    relacionados: ["acao", "diversificacao", "ibovespa"],
  },
  {
    slug: "fii",
    termo: "FII",
    definicaoCurta:
      "Fundo que investe em imóveis. Você recebe parte dos aluguéis sem comprar um imóvel inteiro.",
    relacionados: ["dividendos", "vacancia", "p-vp"],
  },
  {
    slug: "dividendos",
    termo: "dividendos",
    definicaoCurta:
      "A parte do lucro que uma empresa ou fundo distribui a quem é sócio.",
    relacionados: ["acao", "fii", "dividend-yield"],
  },

  /* -------- Indicadores técnicos -------- */
  {
    slug: "dividend-yield",
    termo: "dividend yield",
    definicaoCurta:
      "Mede quanto um ativo distribuiu em dividendos nos últimos 12 meses em relação ao preço dele.",
    exemplo:
      "Uma cota de R$ 100 que pagou R$ 9 no ano tem dividend yield de 9%.",
    porQueImporta:
      "Ajuda a comparar renda entre ativos — mas um número alto pode vir de queda no preço, não de aumento no pagamento.",
    relacionados: ["dividendos", "fii", "acao"],
  },
  {
    slug: "p-l",
    termo: "P/L",
    definicaoCurta:
      "Preço dividido pelo lucro por ação. Indica quantos anos de lucro atual o preço representa.",
    exemplo: "P/L de 14 significa 14 anos de lucro no ritmo de hoje.",
    porQueImporta:
      "Serve para comparar empresas do mesmo setor. Entre setores diferentes, engana.",
    relacionados: ["acao", "ev-ebitda"],
  },
  {
    slug: "ev-ebitda",
    termo: "EV/EBITDA",
    definicaoCurta:
      "Compara o valor total da empresa, incluindo dívidas, com a geração de caixa operacional dela.",
    porQueImporta:
      "Diferente do P/L, considera o endividamento — por isso é preferido em setores que usam muita dívida.",
    relacionados: ["p-l", "acao"],
  },
  {
    slug: "p-vp",
    termo: "P/VP",
    definicaoCurta:
      "Preço da cota dividido pelo valor patrimonial dela. Abaixo de 1 significa preço menor que o patrimônio.",
    porQueImporta:
      "É a régua mais usada em fundos imobiliários — mas patrimônio barato às vezes é barato por um motivo.",
    relacionados: ["fii"],
  },
  {
    slug: "vacancia",
    termo: "vacância",
    definicaoCurta:
      "Percentual dos imóveis de um fundo que está sem inquilino.",
    porQueImporta:
      "Imóvel vago não paga aluguel, então vacância subindo costuma derrubar o rendimento distribuído.",
    relacionados: ["fii", "dividend-yield"],
  },
  {
    slug: "duration",
    termo: "duration",
    definicaoCurta:
      "Mede quanto o preço de um título reage a mudanças de juros. Quanto maior, mais o preço balança.",
    exemplo:
      "Duration de 7 anos significa que uma alta de 1% no juro derruba o preço em cerca de 7%.",
    porQueImporta:
      "Explica por que um título 'de renda fixa' pode aparecer no negativo antes do vencimento.",
    relacionados: ["tesouro-direto", "renda-fixa", "spread"],
  },
  {
    slug: "spread",
    termo: "spread",
    definicaoCurta:
      "A diferença entre duas taxas — normalmente o quanto um título paga acima de uma referência segura.",
    porQueImporta:
      "Spread maior significa mais retorno prometido, e quase sempre mais risco junto.",
    relacionados: ["renda-fixa", "duration"],
  },
  {
    slug: "liquidez",
    termo: "liquidez",
    definicaoCurta:
      "A rapidez com que você transforma um investimento em dinheiro na conta.",
    relacionados: ["reserva-emergencia", "renda-fixa"],
  },
  {
    slug: "volatilidade",
    termo: "volatilidade",
    definicaoCurta:
      "O tamanho do sobe e desce de um ativo. Quanto maior, mais o valor oscila no caminho.",
    relacionados: ["renda-variavel", "risco"],
  },
  {
    slug: "risco",
    termo: "risco",
    definicaoCurta:
      "A chance de o resultado ser diferente do esperado — inclusive pior. Todo investimento tem algum.",
    relacionados: ["volatilidade", "diversificacao"],
  },
  {
    slug: "diversificacao",
    termo: "diversificação",
    definicaoCurta:
      "Dividir o dinheiro entre coisas diferentes, para que um resultado ruim não afete tudo de uma vez.",
    relacionados: ["etf", "risco"],
  },
  {
    slug: "reserva-emergencia",
    termo: "reserva de emergência",
    definicaoCurta:
      "Dinheiro guardado para imprevistos, que você consegue sacar a qualquer momento.",
    exemplo: "Costuma-se falar em três a seis meses das suas despesas.",
    relacionados: ["liquidez", "renda-fixa"],
  },

  /* -------- Ofertas -------- */
  {
    slug: "ipo",
    termo: "IPO",
    definicaoCurta:
      "Quando uma empresa passa a ser negociada na bolsa pela primeira vez e vende ações ao público.",
    relacionados: ["acao", "oferta-publica", "prospecto", "b3"],
  },
  {
    slug: "follow-on",
    termo: "follow-on",
    definicaoCurta:
      "Quando uma empresa que já está na bolsa vende um novo lote de ações.",
    relacionados: ["ipo", "oferta-publica"],
  },
  {
    slug: "oferta-publica",
    termo: "oferta pública",
    definicaoCurta:
      "Venda de um investimento ao público em geral, seguindo regras da CVM.",
    relacionados: ["ipo", "cvm", "prospecto"],
  },
  {
    slug: "prospecto",
    termo: "prospecto",
    definicaoCurta:
      "Documento oficial de uma oferta. Traz os números da empresa e os riscos, por escrito.",
    porQueImporta:
      "Enquanto ele não existe, tudo que circula sobre a oferta é expectativa.",
    relacionados: ["ipo", "oferta-publica", "cvm"],
  },
];

const porSlug = new Map(termos.map((t) => [t.slug, t]));

export function getTermo(slug: string): Termo | undefined {
  return porSlug.get(slug);
}

export function existeTermo(slug: string): boolean {
  return porSlug.has(slug);
}
