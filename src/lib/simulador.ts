/**
 * SIMULADOR — MOTOR DETERMINÍSTICO
 *
 * Nenhum modelo de linguagem escolhe alocação aqui. Esta função
 * recebe as respostas e devolve as fatias; a mesma entrada produz
 * sempre a mesma saída. É o que torna o resultado testável,
 * auditável e defensável.
 *
 * O papel da IA no produto é redigir e interpretar — nunca decidir
 * onde vai o dinheiro de alguém.
 *
 * Todo resultado carrega `regra`: qual regra dominou a decisão. Sem
 * isso não dá para auditar nem explicar ao leitor.
 */

export type Prazo = "ate1" | "1a3" | "3a5" | "mais5";
export type Tolerancia = "seguranca" | "alguma" | "bastante";
export type TemReserva = "sim" | "nao";

export type Respostas = {
  valor: number;
  prazo: Prazo;
  tolerancia: Tolerancia;
  reserva: TemReserva;
};

export type ClasseSim =
  | "reserva"
  | "tesouro-ipca"
  | "etf-brasil"
  | "etf-exterior"
  | "fii"
  | "acoes";

export type Fatia = {
  classe: ClasseSim;
  percentual: number;
  valor: number;
  porque: string;
};

/**
 * Resumo agregado da distribuição.
 *
 * Existe porque a soma das fatias não é óbvia: alguém que vê "25% em
 * ações" não conclui sozinho quanto do total continua acessível em um
 * dia. São três perguntas práticas respondidas com aritmética simples,
 * sem projeção de retorno — projetar rendimento seria prometer
 * resultado, que é o que o produto não faz.
 */
export type Resumo = {
  /** % com resgate em até dois dias úteis. */
  liquidoRapido: number;
  /** % que acompanha a inflação por construção. */
  protegidoInflacao: number;
  /** % em renda variável. */
  emRendaVariavel: number;
  riscoPonderado: "baixo" | "medio" | "alto";
};

export type Resultado = {
  total: number;
  fatias: Fatia[];
  /** Texto do "por que estou vendo isso". Nunca é rodapé. */
  justificativa: string;
  regra: string;
  /** O que faria esta leitura deixar de valer. */
  invalidaria: string;
  /** Anos, para ordenar oportunidades por aderência ao horizonte. */
  horizonteAnos: number;
  resumo: Resumo;
};

/**
 * `horizonteNatural` é o prazo próprio da classe, não o do usuário.
 *
 * A reserva é o dinheiro que pode ser preciso a qualquer momento —
 * ordenar os títulos dela pelo horizonte de 10 anos da carteira
 * colocava o vencimento mais longo em primeiro, que é o oposto do que
 * serve. Quando é `undefined`, vale o horizonte do usuário.
 */
export const CLASSES: Record<
  ClasseSim,
  {
    nome: string;
    cor: string;
    risco: string;
    liquidez: string;
    ticker?: string;
    horizonteNatural?: number;
  }
> = {
  reserva: {
    nome: "Reserva com liquidez diária",
    cor: "var(--tinta-600)",
    risco: "Baixo",
    liquidez: "Alta",
    // Dinheiro de emergência é sempre de curtíssimo prazo, mesmo numa
    // carteira de dez anos.
    horizonteNatural: 1,
  },
  "tesouro-ipca": {
    nome: "Título atrelado à inflação",
    cor: "var(--alta-700)",
    risco: "Baixo",
    liquidez: "Média",
    ticker: "TESOURO-IPCA-2035",
  },
  "etf-brasil": {
    nome: "ETF de índice brasileiro",
    cor: "var(--alta-500)",
    risco: "Médio",
    liquidez: "Alta",
    ticker: "ETFI11",
  },
  "etf-exterior": {
    nome: "ETF internacional",
    cor: "var(--ia-regra)",
    risco: "Médio",
    liquidez: "Alta",
    ticker: "EXTR11",
  },
  fii: {
    nome: "Fundo imobiliário",
    cor: "var(--atencao-500)",
    risco: "Médio",
    liquidez: "Média",
    ticker: "MRDA11",
  },
  acoes: {
    nome: "Ações",
    cor: "var(--baixa-500)",
    risco: "Alto",
    liquidez: "Alta",
  },
};

const PORQUE: Record<ClasseSim, string> = {
  reserva:
    "É a parte que fica acessível. Rende perto dos juros básicos e você resgata rápido se precisar.",
  "tesouro-ipca":
    "Protege o poder de compra: rende a inflação mais uma taxa fixa, travada no dia da compra.",
  "etf-brasil":
    "Com uma compra o dinheiro se espalha por dezenas de empresas brasileiras, sem precisar escolher uma.",
  "etf-exterior":
    "Coloca uma parte fora do Brasil. Quando a bolsa daqui vai mal, nem sempre a de lá vai junto.",
  fii: "Recebe parte de aluguéis de imóveis sem comprar um imóvel inteiro, com pagamento mensal.",
  acoes:
    "É a fatia que pode render mais no longo prazo — e a que mais oscila no caminho.",
};

/* ================================================================
   ⚠️  MATRIZ PROVISÓRIA — NÃO REVISADA POR PROFISSIONAL HABILITADO

   Os percentuais são placeholders estruturais. Existem para que o
   fluxo seja percorrido e a interface validada; não são recomendação
   e não foram revisados por ninguém com competência para isso.

   É a única coisa que precisa mudar quando os números forem
   definidos: nenhuma regra, componente ou tela depende dos valores.
   ================================================================ */
type Faixa = "curto" | "medio" | "longo";

const MATRIZ: Record<Tolerancia, Record<Faixa, Partial<Record<ClasseSim, number>>>> =
  {
    seguranca: {
      curto: { reserva: 100 },
      medio: { reserva: 65, "tesouro-ipca": 35 },
      longo: { reserva: 40, "tesouro-ipca": 40, "etf-brasil": 20 },
    },
    alguma: {
      curto: { reserva: 100 },
      medio: { reserva: 50, "tesouro-ipca": 30, "etf-brasil": 20 },
      longo: {
        reserva: 25,
        "tesouro-ipca": 25,
        "etf-brasil": 30,
        fii: 20,
      },
    },
    bastante: {
      curto: { reserva: 100 },
      medio: { reserva: 40, "tesouro-ipca": 20, "etf-brasil": 40 },
      longo: {
        reserva: 15,
        "etf-brasil": 35,
        "etf-exterior": 25,
        acoes: 25,
      },
    },
  };

/** Abaixo disso, fracionar em várias fatias ensina menos que uma só. */
const PISO_FRACIONAR = 300;

function faixaDe(prazo: Prazo): Faixa {
  if (prazo === "ate1") return "curto";
  if (prazo === "1a3") return "medio";
  return "longo";
}

/** Ponto médio de cada faixa, em anos. Usado para ordenar títulos. */
const ANOS: Record<Prazo, number> = { ate1: 1, "1a3": 2, "3a5": 4, mais5: 10 };

/** Características de cada classe, para o resumo agregado. */
const PERFIL: Record<
  ClasseSim,
  { liquidoRapido: boolean; indexadoInflacao: boolean; variavel: boolean; risco: number }
> = {
  reserva: { liquidoRapido: true, indexadoInflacao: false, variavel: false, risco: 1 },
  "tesouro-ipca": { liquidoRapido: true, indexadoInflacao: true, variavel: false, risco: 1 },
  "etf-brasil": { liquidoRapido: true, indexadoInflacao: false, variavel: true, risco: 2 },
  "etf-exterior": { liquidoRapido: true, indexadoInflacao: false, variavel: true, risco: 2 },
  fii: { liquidoRapido: false, indexadoInflacao: false, variavel: true, risco: 2 },
  acoes: { liquidoRapido: true, indexadoInflacao: false, variavel: true, risco: 3 },
};

function resumir(fatias: Fatia[]): Resumo {
  const soma = (f: (p: (typeof PERFIL)[ClasseSim]) => boolean) =>
    fatias.reduce((s, x) => (f(PERFIL[x.classe]) ? s + x.percentual : s), 0);

  const risco =
    fatias.reduce((s, x) => s + PERFIL[x.classe].risco * x.percentual, 0) / 100;

  return {
    liquidoRapido: soma((p) => p.liquidoRapido),
    protegidoInflacao: soma((p) => p.indexadoInflacao),
    emRendaVariavel: soma((p) => p.variavel),
    riscoPonderado: risco <= 1.35 ? "baixo" : risco <= 2.2 ? "medio" : "alto",
  };
}

const ROTULO_PRAZO: Record<Prazo, string> = {
  ate1: "em até 1 ano",
  "1a3": "entre 1 e 3 anos",
  "3a5": "entre 3 e 5 anos",
  mais5: "daqui a mais de 5 anos",
};

const ROTULO_TOLERANCIA: Record<Tolerancia, string> = {
  seguranca: "prefere segurança",
  alguma: "aceita alguma oscilação",
  bastante: "aceita bastante oscilação",
};

/**
 * Ordem de precedência. É aqui que mora a segurança do simulador —
 * as regras de cima vencem as de baixo, sempre, sem exceção.
 */
export function simular(r: Respostas): Resultado {
  const total = Math.max(0, Math.round(r.valor));

  // ── Regra 1 ──────────────────────────────────────────────────
  // Sem reserva de emergência, tudo vai para liquidez diária. Vence
  // inclusive quem declarou aceitar bastante oscilação: quem não tem
  // colchão e investe em renda variável costuma ser forçado a vender
  // no pior momento — é justamente o que o produto existe para evitar.
  if (r.reserva === "nao") {
    const fatias: Fatia[] = [
      { classe: "reserva", percentual: 100, valor: total, porque: PORQUE.reserva },
    ];
    return {
      total,
      fatias,
      justificativa:
        "Você indicou que ainda não tem uma reserva para emergências. Por isso a simulação coloca tudo em liquidez diária primeiro — independentemente do resto das respostas.",
      regra: "R1 · sem reserva de emergência",
      invalidaria:
        "Assim que a reserva estiver formada, refaça a simulação: o resultado muda por completo.",
      horizonteAnos: ANOS[r.prazo],
      resumo: resumir(fatias),
    };
  }

  const faixa = faixaDe(r.prazo);

  // ── Regra 2 ──────────────────────────────────────────────────
  // Prazo curto vence apetite por risco. Dinheiro que será usado em
  // menos de um ano não vai para renda variável, mesmo que a pessoa
  // tenha marcado "aceito bastante oscilação". A tela explica isso em
  // vez de simplesmente ignorar a resposta dela.
  const contradiz = faixa === "curto" && r.tolerancia !== "seguranca";

  const pesos = MATRIZ[r.tolerancia][faixa];
  const entradas = Object.entries(pesos) as [ClasseSim, number][];

  // ── Regra 3 ──────────────────────────────────────────────────
  const usadas: [ClasseSim, number][] =
    total < PISO_FRACIONAR ? [[entradas[0][0], 100]] : entradas;

  // Arredondamento: as fatias intermediárias arredondam normalmente e
  // a última recebe o resto, para a soma bater com o total informado.
  // Sem isso a barra fecha em R$ 1.999 e o leitor repara.
  let acumulado = 0;
  const fatias: Fatia[] = usadas.map(([classe, percentual], i) => {
    const ultima = i === usadas.length - 1;
    const valor = ultima
      ? total - acumulado
      : Math.round((total * percentual) / 100);
    acumulado += valor;
    return { classe, percentual, valor, porque: PORQUE[classe] };
  });

  return {
    total,
    fatias,
    justificativa: contradiz
      ? `Você indicou que ${ROTULO_TOLERANCIA[r.tolerancia]}, mas também que vai usar o dinheiro ${ROTULO_PRAZO[r.prazo]}. Quando o prazo é curto, o prazo manda: não sobra tempo para se recuperar de uma queda.`
      : `A simulação considera que você ${ROTULO_TOLERANCIA[r.tolerancia]} e pretende usar o dinheiro ${ROTULO_PRAZO[r.prazo]}.`,
    regra: contradiz
      ? "R2 · prazo curto sobrepõe tolerância a risco"
      : total < PISO_FRACIONAR
        ? "R3 · valor abaixo do piso para fracionar"
        : "R4 · matriz por tolerância e prazo",
    invalidaria:
      faixa === "longo"
        ? "Se o prazo encurtar — uma meta que antecipa, uma despesa que aparece — a fatia de renda variável deixa de fazer sentido antes de qualquer mudança no mercado."
        : "Se o prazo se alongar, vale refazer: horizonte maior muda o que é adequado mais do que qualquer notícia do dia.",
    horizonteAnos: ANOS[r.prazo],
    resumo: resumir(fatias),
  };
}
