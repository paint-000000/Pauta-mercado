/**
 * Modelo de domínio do jornal.
 *
 * Invariante que atravessa o arquivo: nada que seja dado de mercado,
 * notícia, oferta ou evento existe sem `fonte`. Não é campo opcional
 * e não é preenchido depois — o compilador impede que um número sem
 * procedência chegue à página.
 *
 * O correlato disso na interface: análise de IA nunca compartilha o
 * mesmo tratamento visual de conteúdo apurado. Ver `tokens.css`.
 */

/* ================= Procedência ================= */

export type Fonte = {
  nome: string;
  url?: string;
  /** ISO 8601. */
  publicadoEm: string;
};

/**
 * `apurado`  — veio da fonte primária, sem interpretação.
 * `analise`  — leitura da IA sobre dados apurados. Sempre citando as fontes.
 * `exemplo`  — conteúdo fictício de protótipo. Não pode ir a produção.
 */
export type Natureza = "apurado" | "analise" | "exemplo";

export type ComFonte = {
  fontes: Fonte[];
  natureza: Natureza;
};

/* ================= Mercado ================= */

export type Direcao = "alta" | "baixa" | "estavel";

export type ClasseIndicador =
  | "indice"
  | "moeda"
  | "cripto"
  | "juro"
  | "inflacao";

export type Indicador = ComFonte & {
  id: string;
  nome: string;
  /** Símbolo curto para a faixa de cotações. */
  sigla: string;
  classe: ClasseIndicador;
  valor: number;
  /** Casas decimais na exibição. Índice usa 0, câmbio usa 2. */
  casas: number;
  prefixo?: string;
  sufixo?: string;
  variacao: number;
  variacaoPct: number;
  direcao: Direcao;
  /** Contexto do número: "ao ano", "12 meses", "fechamento". */
  referencia: string;
  /** Série curta para o sparkline. Últimos ~30 pontos. */
  serie: number[];
  explicacao: string;
};

/* ================= Estados do radar ================= */

/**
 * Os seis estados. São um tipo, e não string livre, porque a
 * gradação é a espinha do produto: sem ela a IA vira um robô que
 * distribui recomendação de compra.
 *
 * A ordem é significativa — do mais favorável ao mais adverso.
 */
export type EstadoRadar =
  | "oportunidade"
  | "favoravel"
  | "observar"
  | "neutro"
  | "cautela"
  | "risco";

export const ESTADOS: EstadoRadar[] = [
  "oportunidade",
  "favoravel",
  "observar",
  "neutro",
  "cautela",
  "risco",
];

export type Horizonte = "curto" | "medio" | "longo";
export type NivelRisco = "baixo" | "medio" | "alto";

/* ================= Ativos ================= */

export type TipoAtivo =
  | "acao"
  | "fii"
  | "etf"
  | "titulo"
  | "indice"
  | "moeda"
  | "cripto";

export type IndicadorAtivo = {
  rotulo: string;
  valor: string;
  /** Slug no glossário. O rótulo vira chip explicável. */
  termo?: string;
};

export type Ativo = ComFonte & {
  ticker: string;
  nome: string;
  tipo: TipoAtivo;
  setor?: string;
  preco: number;
  casas: number;
  prefixo?: string;
  variacao: number;
  variacaoPct: number;
  direcao: Direcao;
  serie: number[];
  /** Explicação do ativo para quem nunca ouviu falar dele. */
  resumo: string;
  /** Presente só quando o ativo está no radar. */
  radar?: {
    estado: EstadoRadar;
    tese: string;
    horizonte: Horizonte;
    risco: NivelRisco;
    positivos: string[];
    riscos: string[];
    /** O que faria a tese deixar de valer. É o campo mais importante. */
    invalidaria: string;
    perfil: string;
  };
  indicadores: IndicadorAtivo[];
};

/* ================= Radar ================= */

export type EntradaRadar = ComFonte & {
  id: string;
  estado: EstadoRadar;
  titulo: string;
  /** Ticker, quando a entrada aponta para um ativo com página. */
  ticker?: string;
  /** Por que entrou no radar hoje. */
  motivo: string;
  tese: string;
  horizonte: Horizonte;
  risco: NivelRisco;
  perfil: string;
  invalidaria: string;
};

/* ================= Notícias ================= */

export type Categoria =
  | "economia"
  | "mercados"
  | "acoes"
  | "fiis"
  | "renda-fixa"
  | "etfs"
  | "exterior"
  | "ipos";

export type Cenario = {
  tipo: "positivo" | "neutro" | "negativo";
  texto: string;
};

/** A camada de IA de uma notícia. Sempre separada do texto apurado. */
export type AnaliseIA = {
  resumo: string;
  impacto: string;
  /** Tickers de ativos potencialmente afetados. */
  relacionados: string[];
  cenarios: Cenario[];
  /** Próximos indicadores e eventos que confirmam ou derrubam a leitura. */
  acompanhar: string[];
  geradoEm: string;
  modelo: string;
};

export type Noticia = ComFonte & {
  slug: string;
  titulo: string;
  /** Antetítulo curto. Convenção de jornal. */
  chapeu: string;
  resumo: string;
  categoria: Categoria;
  /** ISO 8601. */
  publicadoEm: string;
  /** Parágrafos do texto apurado. Aceita marcação [[termo]]. */
  corpo: string[];
  destaque?: boolean;
  imagem?: { cor: string; legenda: string };
  analise: AnaliseIA;
};

/* ================= IPOs ================= */

export type StatusIpo =
  | "rumor"
  | "em-estudo"
  | "prospecto"
  | "em-andamento"
  | "precificado"
  | "encerrado";

/** Status que afirmam que a oferta existe exigem fonte primária. */
export const STATUS_EXIGE_OFICIAL: StatusIpo[] = [
  "prospecto",
  "em-andamento",
  "precificado",
];

export type Ipo = ComFonte & {
  slug: string;
  empresa: string;
  setor: string;
  mercado: string;
  status: StatusIpo;
  /** Só quando houver informação oficial. Nunca estimado. */
  dataPrevista?: string;
  faixaPreco?: string;
  oQueE: string;
  porQueImporta: string;
  riscos: string[];
  oQueObservar: string[];
};

/* ================= Calendário ================= */

export type ImportanciaEvento = "alta" | "media" | "baixa";

export type EventoCalendario = ComFonte & {
  id: string;
  /** ISO, só data. */
  data: string;
  hora?: string;
  titulo: string;
  tipo: "politica-monetaria" | "indicador" | "resultado" | "oferta" | "exterior";
  importancia: ImportanciaEvento;
  descricao: string;
  /** O que o número pode mexer. */
  porQueImporta: string;
};

/* ================= Glossário ================= */

export type Termo = {
  slug: string;
  termo: string;
  definicaoCurta: string;
  exemplo?: string;
  porQueImporta?: string;
  relacionados: string[];
};

/* ================= Edição do dia ================= */

/** O "Bom dia, mercado" — a primeira página do jornal. */
export type Edicao = {
  data: string;
  saudacao: string;
  chamada: string;
  /** Mercado em 60 segundos. Numerados, curtos. */
  sessenta: string[];
  /** O principal risco do dia. Um só. */
  riscoDoDia: string;
  geradoEm: string;
  modelo: string;
};

/* ================= Preferências locais ================= */

export type Interesse =
  | "renda-fixa"
  | "acoes"
  | "fiis"
  | "exterior"
  | "cripto"
  | "ipos";

export type Preferencias = {
  interesses: Interesse[];
  atualizadoEm: string;
};
