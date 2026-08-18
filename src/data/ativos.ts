import type { Ativo, Fonte } from "@/types";
import { gerarSerie } from "@/lib/serie";

/**
 * ⚠️  DADOS DE PROTÓTIPO — e uma decisão que precisa ficar registrada.
 *
 * As EMPRESAS individuais aqui são fictícias, de propósito.
 *
 * O produto exige que a IA interprete dados, não os invente. Escrever
 * uma tese de "cautela por valuation esticado" sobre uma companhia
 * real, com números que eu inventei, produziria exatamente o artefato
 * que o produto existe para não produzir — e um print de tela dessa
 * página não teria como se defender.
 *
 * O que é real aqui: as CLASSES de ativo (Tesouro IPCA+, ETF de
 * índice, FII de tijolo) e os índices e moedas. São categorias
 * públicas, sem tese sobre uma companhia específica.
 *
 * Trocar por tickers reais quando houver dado e análise de verdade é
 * mudança de arquivo de dados, não de código.
 */

const HOJE = "2026-08-18T18:20:00-03:00";
const f = (nome: string, url?: string): Fonte => ({
  nome,
  url,
  publicadoEm: HOJE,
});

type Base = Omit<Ativo, "serie" | "natureza">;

const base: Base[] = [
  {
    ticker: "TESOURO-IPCA-2035",
    nome: "Tesouro IPCA+ 2035",
    tipo: "titulo",
    setor: "Título público federal",
    // Sem prefixo: o número desta linha é uma taxa ao ano, não um preço.
    preco: 6.42,
    casas: 2,
    variacao: 0.08,
    variacaoPct: 1.26,
    direcao: "alta",
    resumo:
      "É um empréstimo ao governo federal com vencimento em 2035. Paga a [[inflacao]] do período mais uma taxa fixa combinada na compra — por isso o número acima é uma taxa, não um preço.",
    radar: {
      estado: "oportunidade",
      tese: "Com o juro real ainda acima de 6% ao ano, um título que entrega [[ipca]] mais essa taxa trava um ganho acima da inflação por mais de dez anos. Historicamente, janelas com juro real nesse patamar não duram muito.",
      horizonte: "longo",
      risco: "baixo",
      positivos: [
        "Protege o poder de compra por definição: o rendimento é inflação mais taxa.",
        "Risco de crédito é o menor disponível no país — quem paga é o Tesouro Nacional.",
        "Travar taxa alta agora vale para todo o prazo, mesmo que os juros caiam depois.",
      ],
      riscos: [
        "Vender antes de 2035 pode gerar prejuízo: o preço oscila conforme o juro do mercado.",
        "Se a [[selic]] subir muito, títulos novos pagarão mais e o seu ficará relativamente pior.",
        "É dinheiro que precisa ficar parado. Não serve como [[reserva-emergencia|reserva de emergência]].",
      ],
      invalidaria:
        "Uma piora fiscal que force o juro real para cima de forma persistente derrubaria o preço do título e tornaria melhor esperar. O sinal a observar é o comportamento dos vencimentos longos, não o do dia.",
      perfil:
        "Quem tem horizonte de dez anos ou mais e não vai precisar desse dinheiro no caminho.",
    },
    indicadores: [
      { rotulo: "Taxa real", valor: "IPCA + 6,42%", termo: "ipca" },
      { rotulo: "Vencimento", valor: "15/05/2035" },
      { rotulo: "Duration", valor: "7,1 anos", termo: "duration" },
      { rotulo: "Investimento mínimo", valor: "R$ 32,10" },
      { rotulo: "Liquidez", valor: "Diária (D+1)", termo: "liquidez" },
    ],
    fontes: [f("Tesouro Direto", "https://www.tesourodireto.com.br")],
  },
  {
    ticker: "ETFI11",
    nome: "ETF Índice Brasil",
    tipo: "etf",
    setor: "Renda variável · Brasil",
    preco: 132.48,
    casas: 2,
    prefixo: "R$ ",
    variacao: 1.02,
    variacaoPct: 0.78,
    direcao: "alta",
    resumo:
      "Fundo negociado em bolsa que replica o [[ibovespa]]. Com uma compra você fica exposto às principais empresas brasileiras de uma vez — é a forma mais simples de entrar em [[renda-variavel]].",
    radar: {
      estado: "favoravel",
      tese: "Queda da [[inflacao]] com juro parado tende a favorecer a bolsa doméstica, porque abre espaço para corte de juros no futuro. Um [[etf]] de índice captura esse movimento sem exigir escolher empresa.",
      horizonte: "longo",
      risco: "medio",
      positivos: [
        "[[diversificacao|Diversificação]] automática: uma empresa ruim é uma fatia pequena do todo.",
        "Taxa de administração baixa comparada a fundos ativos.",
        "[[liquidez|Liquidez]] alta — dá para comprar e vender no mesmo dia.",
      ],
      riscos: [
        "Acompanha o índice na queda também. Períodos de meses no negativo são normais.",
        "Concentração setorial do [[ibovespa]] em commodities e bancos é herdada pelo ETF.",
      ],
      invalidaria:
        "Uma retomada da inflação que force o Banco Central a voltar a subir juros tiraria o principal sustento desta leitura.",
      perfil:
        "Quem já tem reserva formada e aceita ver o valor oscilar por alguns anos.",
    },
    indicadores: [
      { rotulo: "Índice replicado", valor: "Ibovespa", termo: "ibovespa" },
      { rotulo: "Taxa de administração", valor: "0,30% a.a." },
      { rotulo: "Patrimônio", valor: "R$ 14,2 bi" },
      { rotulo: "Volume médio diário", valor: "R$ 218 mi" },
    ],
    fontes: [f("B3", "https://www.b3.com.br")],
  },
  {
    ticker: "EXTR11",
    nome: "ETF Exterior Desenvolvidos",
    tipo: "etf",
    setor: "Renda variável · Global",
    preco: 98.15,
    casas: 2,
    prefixo: "R$ ",
    variacao: -0.42,
    variacaoPct: -0.43,
    direcao: "baixa",
    resumo:
      "Replica um índice de empresas de países desenvolvidos. Comprado em reais, na [[b3]], sem precisar abrir conta no exterior.",
    radar: {
      estado: "observar",
      tese: "Serve para reduzir a dependência do Brasil na carteira. Mas o real vem se valorizando, e câmbio em queda corrói o retorno de quem investe lá fora — o momento de entrada importa mais aqui do que em outros ativos.",
      horizonte: "longo",
      risco: "medio",
      positivos: [
        "Reduz a concentração em um único país e uma única moeda.",
        "Acesso a setores praticamente ausentes da bolsa brasileira.",
      ],
      riscos: [
        "Dupla oscilação: a das empresas e a do câmbio.",
        "Real forte pode anular um bom desempenho das ações lá fora.",
        "Tributação diferente da de ações brasileiras — confira antes.",
      ],
      invalidaria:
        "Uma valorização adicional e persistente do real tornaria a entrada pior do que esperar; já uma reversão cambial reforçaria a tese.",
      perfil: "Quem monta carteira de longo prazo e quer diluir risco de país.",
    },
    indicadores: [
      { rotulo: "Exposição cambial", valor: "Sem proteção" },
      { rotulo: "Taxa de administração", valor: "0,25% a.a." },
      { rotulo: "Países", valor: "23" },
      { rotulo: "Patrimônio", valor: "R$ 3,8 bi" },
    ],
    fontes: [f("B3", "https://www.b3.com.br")],
  },
  {
    ticker: "MRDA11",
    nome: "Merídia Renda Urbana",
    tipo: "fii",
    setor: "Fundo imobiliário · Logística (exemplo)",
    preco: 104.7,
    casas: 2,
    prefixo: "R$ ",
    variacao: 0.35,
    variacaoPct: 0.34,
    direcao: "alta",
    resumo:
      "Empresa fictícia usada no protótipo. Seria um [[fii]] dono de galpões alugados para operações de comércio eletrônico, distribuindo o aluguel aos cotistas todo mês.",
    radar: {
      estado: "neutro",
      tese: "O rendimento mensal é competitivo, mas fundos de tijolo tendem a andar de lado enquanto o juro está alto — porque a renda fixa entrega retorno parecido com menos oscilação.",
      horizonte: "longo",
      risco: "medio",
      positivos: [
        "Renda mensal previsível enquanto os contratos estiverem vigentes.",
        "Contratos longos reduzem o risco de vacância no curto prazo.",
      ],
      riscos: [
        "Galpão vago derruba o rendimento distribuído.",
        "Concentração em poucos inquilinos amplia o impacto de uma saída.",
        "A cota oscila em bolsa, mesmo com o aluguel estável.",
      ],
      invalidaria:
        "Queda consistente da [[selic]] mudaria a comparação com a renda fixa e reclassificaria este ativo para favorável.",
      perfil: "Quem busca renda periódica e aceita oscilação da cota.",
    },
    indicadores: [
      { rotulo: "Dividend yield", valor: "9,4% a.a.", termo: "dividend-yield" },
      { rotulo: "Último rendimento", valor: "R$ 0,82/cota" },
      { rotulo: "Vacância", valor: "4,1%", termo: "vacancia" },
      { rotulo: "P/VP", valor: "0,96", termo: "p-vp" },
      { rotulo: "Nº de imóveis", valor: "11" },
    ],
    fontes: [f("Dados de protótipo")],
  },
  {
    ticker: "NRTE3",
    nome: "Norte Logística",
    tipo: "acao",
    setor: "Transporte e logística (exemplo)",
    preco: 27.84,
    casas: 2,
    prefixo: "R$ ",
    variacao: 0.61,
    variacaoPct: 2.24,
    direcao: "alta",
    resumo:
      "Empresa fictícia usada no protótipo. Seria uma operadora de transporte e armazenagem para varejo e comércio eletrônico.",
    radar: {
      estado: "favoravel",
      tese: "Empresas de logística ganham com o crescimento do comércio eletrônico e sofrem menos com juro alto do que setores muito endividados. A leitura depende de a margem operacional continuar subindo.",
      horizonte: "longo",
      risco: "alto",
      positivos: [
        "Demanda estrutural crescente puxada pelo comércio eletrônico.",
        "Contratos de longo prazo com grandes varejistas dão previsibilidade.",
      ],
      riscos: [
        "Setor exige investimento pesado e constante em frota e galpões.",
        "Combustível e salários pressionam a margem quando sobem.",
        "Ação individual pode cair muito mais que o índice.",
      ],
      invalidaria:
        "Dois trimestres seguidos de queda de margem operacional derrubariam a tese, mesmo com receita crescendo.",
      perfil:
        "Quem já investe em renda variável, tem horizonte longo e aceita oscilação forte.",
    },
    indicadores: [
      { rotulo: "P/L", valor: "14,2", termo: "p-l" },
      { rotulo: "EV/EBITDA", valor: "7,8", termo: "ev-ebitda" },
      { rotulo: "Dividend yield", valor: "3,1%", termo: "dividend-yield" },
      { rotulo: "Margem EBITDA", valor: "23,4%" },
      { rotulo: "Dívida líquida/EBITDA", valor: "1,8x" },
    ],
    fontes: [f("Dados de protótipo")],
  },
  {
    ticker: "VLCM3",
    nome: "Volcame Energia",
    tipo: "acao",
    setor: "Energia (exemplo)",
    preco: 41.2,
    casas: 2,
    prefixo: "R$ ",
    variacao: -1.34,
    variacaoPct: -3.15,
    direcao: "baixa",
    resumo:
      "Empresa fictícia usada no protótipo. Seria uma geradora e distribuidora de energia elétrica com forte presença regional.",
    radar: {
      estado: "cautela",
      tese: "O preço embute um cenário de execução perfeita enquanto o endividamento cresce. Não é uma tese contra a empresa — é uma observação de que a margem de erro embutida no preço ficou pequena.",
      horizonte: "medio",
      risco: "alto",
      positivos: [
        "Receita regulada dá previsibilidade de caixa.",
        "Setor essencial, com demanda pouco sensível a crise.",
      ],
      riscos: [
        "Alavancagem subindo há quatro trimestres seguidos.",
        "Investimentos obrigatórios de rede consomem caixa nos próximos anos.",
        "Revisão tarifária pode vir abaixo do que o mercado espera.",
      ],
      invalidaria:
        "Uma revisão tarifária acima da expectativa somada a queda da alavancagem reclassificaria o ativo para neutro ou favorável.",
      perfil:
        "Para acompanhar, não para agir agora. Quem já tem posição pode querer revisar tamanho.",
    },
    indicadores: [
      { rotulo: "P/L", valor: "22,6", termo: "p-l" },
      { rotulo: "EV/EBITDA", valor: "11,4", termo: "ev-ebitda" },
      { rotulo: "Dividend yield", valor: "4,8%", termo: "dividend-yield" },
      { rotulo: "Dívida líquida/EBITDA", valor: "3,6x" },
      { rotulo: "Margem EBITDA", valor: "31,2%" },
    ],
    fontes: [f("Dados de protótipo")],
  },
  {
    ticker: "BTC",
    nome: "Bitcoin",
    tipo: "cripto",
    setor: "Criptomoeda",
    preco: 618400,
    casas: 0,
    prefixo: "R$ ",
    variacao: 12800,
    variacaoPct: 2.11,
    direcao: "alta",
    resumo:
      "Criptomoeda de maior valor de mercado. Não gera renda, não distribui [[dividendos]] e não tem lucro por trás — o preço vem só de oferta e demanda.",
    radar: {
      estado: "risco",
      tese: "Está no radar pela oscilação, não por uma tese de valor. Quedas de 30% a 50% em poucos meses fazem parte do histórico do ativo e não indicam anomalia.",
      horizonte: "longo",
      risco: "alto",
      positivos: [
        "Baixa correlação com a bolsa brasileira em alguns períodos.",
        "Liquidez alta e negociação 24 horas.",
      ],
      riscos: [
        "Oscilação muito acima de qualquer classe tradicional.",
        "Não há fluxo de caixa para ancorar o preço.",
        "Mudanças regulatórias podem afetar o acesso rapidamente.",
      ],
      invalidaria:
        "Não há tese de valor a invalidar — é justamente esse o ponto. Quem entra deve dimensionar a posição pelo que aceita perder.",
      perfil:
        "Só quem entende a oscilação e usa uma fatia pequena do patrimônio.",
    },
    indicadores: [
      { rotulo: "Variação 12 meses", valor: "+41,2%" },
      { rotulo: "Máxima 12 meses", valor: "R$ 712.400" },
      { rotulo: "Mínima 12 meses", valor: "R$ 358.900" },
      { rotulo: "Volatilidade anual", valor: "58%", termo: "volatilidade" },
    ],
    fontes: [f("Reuters")],
  },
];

export const ativos: Ativo[] = base.map((b) => ({
  ...b,
  natureza: "exemplo",
  serie: gerarSerie(b.ticker, b.preco, b.variacaoPct),
}));

const porTicker = new Map(ativos.map((a) => [a.ticker.toLowerCase(), a]));

export function getAtivo(ticker: string): Ativo | undefined {
  return porTicker.get(ticker.toLowerCase());
}

export const ROTULO_TIPO: Record<Ativo["tipo"], string> = {
  acao: "Ação",
  fii: "FII",
  etf: "ETF",
  titulo: "Renda fixa",
  indice: "Índice",
  moeda: "Moeda",
  cripto: "Cripto",
};
