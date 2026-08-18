import type { Edicao, EntradaRadar, EstadoRadar, Fonte } from "@/types";

/**
 * O Radar de Hoje — o bloco em que a IA faz curadoria.
 *
 * Toda entrada carrega `invalidaria`. É o campo que separa análise de
 * palpite: se não dá para dizer o que faria a leitura deixar de valer,
 * não é uma tese — é uma opinião com formatação bonita.
 */

const HOJE = "2026-08-18T18:20:00-03:00";
const f = (nome: string, url?: string): Fonte => ({ nome, url, publicadoEm: HOJE });

export const ROTULO_ESTADO: Record<EstadoRadar, string> = {
  oportunidade: "Oportunidade",
  favoravel: "Favorável",
  observar: "Observar",
  neutro: "Neutro",
  cautela: "Cautela",
  risco: "Risco",
};

/** Como cada estado deve ser lido. Aparece na legenda do radar. */
export const SIGNIFICADO_ESTADO: Record<EstadoRadar, string> = {
  oportunidade:
    "Condições incomuns que costumam se fechar. Vale entender agora.",
  favoravel: "O cenário joga a favor, sem urgência.",
  observar: "Algo mudou e ainda não dá para concluir. Acompanhe.",
  neutro: "Nada de novo. Nem a favor, nem contra.",
  cautela: "Sinais de deterioração. Revise antes de aumentar posição.",
  risco: "Oscilação alta ou tese frágil. Dimensione pelo que aceita perder.",
};

export const ROTULO_HORIZONTE = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
} as const;

export const ROTULO_RISCO = {
  baixo: "Risco baixo",
  medio: "Risco médio",
  alto: "Risco alto",
} as const;

export const radar: EntradaRadar[] = [
  {
    id: "tesouro-ipca-longo",
    estado: "oportunidade",
    titulo: "Tesouro IPCA+ 2035",
    ticker: "TESOURO-IPCA-2035",
    motivo:
      "Taxa real acima de 6% ao ano voltou a aparecer depois da decisão do [[copom]].",
    tese: "Travar [[ipca]] mais 6% por mais de dez anos é raro. Janelas assim historicamente não duram muitos trimestres.",
    horizonte: "longo",
    risco: "baixo",
    perfil: "Horizonte de dez anos ou mais, dinheiro que não será usado no caminho.",
    invalidaria:
      "Piora fiscal persistente empurrando o juro real ainda mais para cima — aí valeria esperar.",
    fontes: [f("Tesouro Direto", "https://www.tesourodireto.com.br")],
    natureza: "exemplo",
  },
  {
    id: "etf-indice-brasil",
    estado: "favoravel",
    titulo: "ETF de índice brasileiro",
    ticker: "ETFI11",
    motivo:
      "[[inflacao|Inflação]] de serviços cedendo pelo segundo mês abre espaço para corte de juros à frente.",
    tese: "Bolsa doméstica costuma antecipar ciclo de corte. Um [[etf]] captura o movimento sem exigir escolher empresa.",
    horizonte: "longo",
    risco: "medio",
    perfil: "Quem já tem reserva e aceita oscilação por alguns anos.",
    invalidaria:
      "Retomada da inflação que force o Banco Central a discutir alta de juros novamente.",
    fontes: [f("IBGE", "https://www.ibge.gov.br"), f("B3", "https://www.b3.com.br")],
    natureza: "exemplo",
  },
  {
    id: "etf-exterior",
    estado: "observar",
    titulo: "ETF de exterior",
    ticker: "EXTR11",
    motivo:
      "Fed manteve juros e o mercado adiou a aposta de corte, fortalecendo o dólar.",
    tese: "Diversificar país continua fazendo sentido estrutural, mas o câmbio pesa contra o momento de entrada.",
    horizonte: "longo",
    risco: "medio",
    perfil: "Carteira longa que quer diluir risco de país.",
    invalidaria:
      "Reversão cambial clara reforçaria a tese; real ainda mais forte adiaria a entrada.",
    fontes: [f("Reuters")],
    natureza: "exemplo",
  },
  {
    id: "fii-tijolo",
    estado: "neutro",
    titulo: "Fundos imobiliários de tijolo",
    ticker: "MRDA11",
    motivo:
      "Setor segue negociando abaixo do valor patrimonial há vários trimestres.",
    tese: "Nada mudou nesta semana. A comparação com a [[renda-fixa]] continua desfavorável enquanto o juro estiver aqui.",
    horizonte: "longo",
    risco: "medio",
    perfil: "Quem busca renda mensal e aceita oscilação da cota.",
    invalidaria:
      "Início de ciclo de corte de juros reclassificaria o setor rapidamente.",
    fontes: [f("B3", "https://www.b3.com.br")],
    natureza: "exemplo",
  },
  {
    id: "energia-alavancada",
    estado: "cautela",
    titulo: "Elétricas com alavancagem crescente",
    ticker: "VLCM3",
    motivo:
      "Endividamento do setor sobe pelo quarto trimestre seguido enquanto o preço embute execução perfeita.",
    tese: "Não é tese contra o setor. É observação de que a margem de erro embutida no preço ficou pequena.",
    horizonte: "medio",
    risco: "alto",
    perfil: "Para acompanhar. Quem tem posição pode querer revisar tamanho.",
    invalidaria:
      "Revisão tarifária acima do esperado somada a queda da alavancagem.",
    fontes: [f("Dados de protótipo")],
    natureza: "exemplo",
  },
  {
    id: "cripto",
    estado: "risco",
    titulo: "Bitcoin",
    ticker: "BTC",
    motivo: "Alta de 2% em 24 horas depois de semanas de oscilação forte.",
    tese: "Está no radar pela oscilação, não por tese de valor. Não há fluxo de caixa para ancorar o preço.",
    horizonte: "longo",
    risco: "alto",
    perfil: "Só quem entende a oscilação e usa fatia pequena do patrimônio.",
    invalidaria:
      "Não há tese de valor a invalidar — e é exatamente esse o ponto.",
    fontes: [f("Reuters")],
    natureza: "exemplo",
  },
];

export function getEntradaRadar(id: string): EntradaRadar | undefined {
  return radar.find((r) => r.id === id);
}

/* ================= A edição do dia ================= */

export const edicao: Edicao = {
  data: "2026-08-18",
  saudacao: "Bom dia, mercado",
  chamada:
    "Juros parados por mais tempo do que se esperava. É a informação que organiza todo o resto de hoje.",
  sessenta: [
    "O [[copom]] manteve a [[selic]] em 10,50% e tirou do comunicado a menção a cortes próximos.",
    "O [[di|DI futuro]] curto subiu — o mercado empurrou a aposta de corte para mais adiante.",
    "A [[inflacao]] de serviços cedeu pelo segundo mês, mas segue acima da média histórica.",
    "O [[ibovespa]] fechou em alta de 0,8%, puxado por siderurgia e bancos.",
    "Nos Estados Unidos, o Fed manteve os juros e o dólar se fortaleceu frente a emergentes.",
    "Títulos atrelados à inflação voltaram a pagar mais de 6% de juro real ao ano.",
    "Fundos imobiliários de tijolo continuam abaixo do valor patrimonial.",
  ],
  riscoDoDia:
    "Se a inflação de serviços repicar na próxima leitura, a discussão de corte de juros sai da mesa e os títulos longos que hoje parecem oportunidade caem de preço.",
  geradoEm: "2026-08-18T06:00:00-03:00",
  modelo: "protótipo · conteúdo fixo",
};
