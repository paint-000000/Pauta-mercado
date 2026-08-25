/**
 * PROJEÇÃO — MOTOR DETERMINÍSTICO DE CENÁRIOS
 *
 * Este arquivo responde a uma pergunta que o simulador até aqui se
 * recusava a responder: "quanto isso me devolve ao longo do tempo?".
 *
 * A recusa tinha um motivo bom — projetar UM número é prometer
 * resultado, e o produto não promete. Mas não responder também tem
 * custo: a pessoa vai buscar a resposta em outro lugar, e o lugar de
 * fora quase sempre mostra o número único e otimista.
 *
 * A saída, então, não é um número: é uma FAIXA com três cenários e a
 * probabilidade declarada de cada um. O gráfico mostra o pessimista
 * junto com o otimista, na mesma espessura de traço, e mostra a linha
 * do quanto foi depositado — para que "rendeu" nunca seja confundido
 * com "tenho".
 *
 * Como no simulador, nenhum modelo de linguagem participa: mesma
 * entrada, mesma saída, testável e auditável.
 */

import { CLASSES, type ClasseSim, type Fatia } from "@/lib/simulador";
import { getIndicador } from "@/data/indicadores";

/* ================================================================
   ⚠️  PREMISSAS PROVISÓRIAS — AINDA NÃO REVISADAS POR PROFISSIONAL
       HABILITADO

   O que mudou nesta passagem: os números deixaram de ser digitados
   um a um e passaram a ser DERIVADOS de um cenário macro declarado.
   Antes, "13,0% para ETF de índice" não tinha de onde vir e não dava
   para discordar dele em pedaços. Agora dá: discorda-se do juro real,
   ou do prêmio de risco, ou do beta — e o resto se recalcula sozinho,
   coerente.

   Isso NÃO substitui a revisão por quem tem competência para fazê-la.
   Continua sendo protótipo, continua sem série histórica real, e
   continua na lista de pendências do README. O que mudou é que agora
   existe algo revisável: um número mágico não se revisa, se troca.
   ================================================================ */

/**
 * Cenário macro. Tudo o mais sai daqui.
 *
 * ── Por que não é uma constante ──
 *
 * A primeira versão fixava juro real em 4,0% e pronto. Isso quebrou
 * no dia em que o site passou a puxar dado real: a página mostrava
 * Selic de 14% e a projeção, dois blocos abaixo, dizia que a reserva
 * rendia 8,68% ao ano. Cinco pontos de diferença, no mesmo scroll.
 * Nenhum leitor precisa entender de juro neutro para ver que uma das
 * duas está errada.
 *
 * ── Por que também não é o juro de hoje ──
 *
 * Trocar 4,0% por 14% resolveria a contradição e criaria uma pior:
 * projetar dez anos com a taxa do mês supõe que a política monetária
 * de agosto de 2026 dura até 2036. Selic a 14% é política
 * contracionista, não estado estável — é o remédio, não a temperatura
 * normal do corpo.
 *
 * ── O caminho ──
 *
 * As duas coisas são verdade em prazos diferentes, então o modelo usa
 * as duas: parte do juro real corrente, apurado do Banco Central, e
 * converge para o neutro ao longo de `ANOS_CONVERGENCIA`. Em um ano o
 * resultado fica perto da Selic que está na tela; em dez, perto do
 * neutro. É a mesma lógica do resto do arquivo — o prazo decide o que
 * é relevante.
 */
export type Macro = {
  /** Inflação anual assumida, %. */
  ipca: number;
  /** Juro real da taxa básica hoje, %. */
  juroRealCorrente: number;
  /** Juro real de equilíbrio de longo prazo, %. */
  juroRealNeutro: number;
};

/**
 * Juro real neutro. É premissa, não dado: ninguém observa o juro
 * neutro, ele é estimado. Fica isolado aqui porque é o número que um
 * revisor habilitado vai querer contestar primeiro.
 */
export const JURO_REAL_NEUTRO = 4.0;

/** Em quantos anos a taxa corrente caminha até a neutra. */
export const ANOS_CONVERGENCIA = 3;

/** Valores de reserva, para quando o dado real não estiver disponível. */
const MACRO_PADRAO: Macro = {
  ipca: 4.5,
  juroRealCorrente: 4.0,
  juroRealNeutro: JURO_REAL_NEUTRO,
};

/**
 * O cenário macro a partir do que foi apurado.
 *
 * Só usa o número do Banco Central quando ele é de verdade `apurado`.
 * Se a ingestão nunca rodou, ou se a fonte caiu e o valor é de
 * protótipo, cair no padrão é melhor que projetar em cima de número
 * inventado — e a diferença entre os dois casos está no tipo, não num
 * comentário.
 */
export function macroCorrente(): Macro {
  const selic = getIndicador("selic");
  const ipca = getIndicador("ipca");

  const ipcaReal =
    ipca && ipca.natureza === "apurado" ? ipca.valor : MACRO_PADRAO.ipca;

  const juroRealCorrente =
    selic && selic.natureza === "apurado"
      ? ((1 + selic.valor / 100) / (1 + ipcaReal / 100) - 1) * 100
      : MACRO_PADRAO.juroRealCorrente;

  return {
    ipca: ipcaReal,
    juroRealCorrente,
    juroRealNeutro: JURO_REAL_NEUTRO,
  };
}

/**
 * Juro real médio ao longo de `anos`, no caminho de convergência.
 *
 * A taxa cai linearmente do corrente ao neutro em `ANOS_CONVERGENCIA`
 * e fica lá. O que interessa à projeção não é a taxa de um instante e
 * sim a média do trecho — é ela que compõe. Fechada, sem integrar
 * numericamente:
 *
 *   até a convergência   média do trapézio percorrido
 *   depois dela          trapézio cheio mais o resto no neutro
 */
export function juroRealMedio(m: Macro, anos: number): number {
  const { juroRealCorrente: a, juroRealNeutro: b } = m;
  const tc = ANOS_CONVERGENCIA;

  if (anos <= 0) return a;
  if (anos <= tc) return a + ((b - a) * anos) / (2 * tc);

  return (((a + b) / 2) * tc + b * (anos - tc)) / anos;
}

/** Junta juro real e inflação sem somar os dois na mão. */
const nominal = (real: number, ipca: number) =>
  ((1 + real / 100) * (1 + ipca / 100) - 1) * 100;

/**
 * Prêmios de risco, em pontos percentuais de juro REAL acima da taxa
 * básica. É aqui que mora a opinião do modelo, e é isto que um
 * revisor precisa contestar — não os retornos nominais, que são
 * consequência.
 */
const PREMIO = {
  /** Prazo: travar juro por dez anos paga um pouco mais que o diário. */
  prazo: 0.5,
  /** Renda imobiliária local. */
  imovel: 1.5,
  /**
   * Bolsa brasileira sobre a taxa básica.
   *
   * Este número precisa cobrir o arrasto da volatilidade, e a versão
   * anterior não cobria. Com prêmio de 3,0 pp e oscilação de 22%, o
   * termo −σ²/2 comia quase todo o ganho: as três carteiras do
   * simulador terminavam dez anos com retorno mediano de 10,9%,
   * 11,0% e 11,3% — ou seja, triplicar o risco não pagava nada, e o
   * motor contradizia a regra R4 da tela ao lado.
   *
   * O arrasto é real e continua no modelo. O que estava errado era o
   * prêmio, baixo demais para o risco que ele remunera.
   */
  bolsaBr: 4.5,
  /**
   * Bolsa global convertida em reais. Maior que o de imóvel e menor
   * que o do Brasil: mercado desenvolvido paga prêmio de risco menor,
   * e a diferença de juro real entre aqui e lá tende a voltar pelo
   * câmbio no prazo longo.
   */
  bolsaGlobal: 2.0,
  /**
   * Beta de uma carteira concentrada de ações sobre o índice.
   *
   * É o número mais importante desta tabela, e o mais fácil de errar
   * para o lado errado. A versão anterior dava a ações 14,0% contra
   * 13,0% do ETF, com oscilação bem maior — ou seja, remunerava o
   * risco de escolher errado a empresa. Esse risco não é remunerado:
   * some com diversificação, e o que some de graça ninguém paga para
   * carregar. Com beta de 1,15 o retorno esperado sobe pouco (só o
   * risco de mercado é pago) e a oscilação sobe muito — que é
   * exatamente a lição que a tela deveria ensinar.
   */
  betaConcentrado: 1.15,
};

type Premissa = {
  /** Retorno nominal esperado, % a.a. */
  retorno: number;
  /** Volatilidade anual, % a.a. */
  vol: number;
  /** De onde veio o retorno. Aparece na tela. */
  base: string;
};

/**
 * A tabela de premissas para um horizonte.
 *
 * Deixou de ser constante quando o juro passou a convergir: a mesma
 * carteira tem retorno esperado diferente em um ano e em dez, porque
 * o juro básico que ela pega no caminho é diferente. Fingir uma
 * tabela única esconderia justamente o que a convergência existe para
 * mostrar.
 */
export function premissasPara(anos: number, m: Macro = macroCorrente()): Record<ClasseSim, Premissa> {
  const base = juroRealMedio(m, anos);
  const n = (real: number) => nominal(real, m.ipca);
  const pp = (x: number) => x.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const juro = `juro real médio de ${pp(base)}% no horizonte`;

  return {
    reserva: {
      retorno: n(base),
      vol: 0.8,
      base: `${juro}, mais a inflação`,
    },
    "tesouro-ipca": {
      retorno: n(base + PREMIO.prazo),
      vol: 8.0,
      base: `${juro}, mais ${pp(PREMIO.prazo)} pp por travar o prazo`,
    },
    fii: {
      retorno: n(base + PREMIO.imovel),
      vol: 14.0,
      base: `${juro}, mais ${pp(PREMIO.imovel)} pp de prêmio de renda imobiliária`,
    },
    "etf-exterior": {
      retorno: n(base + PREMIO.bolsaGlobal),
      vol: 17.0,
      base: `${juro}, mais ${pp(PREMIO.bolsaGlobal)} pp de prêmio de bolsa global, em reais`,
    },
    "etf-brasil": {
      retorno: n(base + PREMIO.bolsaBr),
      vol: 22.0,
      base: `${juro}, mais ${pp(PREMIO.bolsaBr)} pp de prêmio de bolsa brasileira`,
    },
    acoes: {
      retorno: n(base + PREMIO.bolsaBr * PREMIO.betaConcentrado),
      vol: 28.0,
      base: `o mesmo prêmio da bolsa, com beta de ${pp(PREMIO.betaConcentrado)} — mais oscilação, quase o mesmo retorno`,
    },
  };
}

/**
 * As premissas em forma de lista, para a tela poder mostrá-las.
 *
 * O produto exige `fonte` em todo número apurado. Número CALCULADO
 * não tem fonte — tem premissa, e esconder a premissa seria pior do
 * que não ter fonte: o leitor veria uma faixa saída do nada. Esta
 * função é o equivalente da procedência para o que foi calculado.
 */
export function premissasPublicas(anos = 10, m: Macro = macroCorrente()) {
  const tabela = premissasPara(anos, m);

  return (Object.keys(tabela) as ClasseSim[])
    .map((classe) => ({
      classe,
      nome: CLASSES[classe].nome,
      ...tabela[classe],
    }))
    .sort((a, b) => a.vol - b.vol);
}

/* ---------------- Correlação ----------------

   A versão anterior usava um número único (0,45) para qualquer par
   de classes. Era simplificação declarada, mas custava caro num
   ponto específico: a fatia de exterior existe no produto porque
   "quando a bolsa daqui vai mal, nem sempre a de lá vai junto" — e
   com correlação única o motor não sabia disso. A tela afirmava um
   benefício que o modelo por baixo não reconhecia.

   A matriz agora sai de blocos. São cinco números em vez de trinta e
   seis, e o que importa aparece: renda fixa quase não acompanha
   bolsa, bolsa brasileira anda junto consigo mesma, e o exterior é a
   única coisa da carteira que descola do resto.                    */

type Bloco = "fixa" | "brasil" | "exterior";

const BLOCO: Record<ClasseSim, Bloco> = {
  reserva: "fixa",
  "tesouro-ipca": "fixa",
  "etf-brasil": "brasil",
  fii: "brasil",
  acoes: "brasil",
  "etf-exterior": "exterior",
};

const ENTRE_BLOCOS: Record<Bloco, Record<Bloco, number>> = {
  fixa: { fixa: 0.35, brasil: 0.1, exterior: 0.05 },
  brasil: { fixa: 0.1, brasil: 0.75, exterior: 0.25 },
  exterior: { fixa: 0.05, brasil: 0.25, exterior: 1 },
};

/** Correlação assumida entre duas classes. Uma classe consigo é 1. */
export function correlacao(a: ClasseSim, b: ClasseSim): number {
  if (a === b) return 1;
  return ENTRE_BLOCOS[BLOCO[a]][BLOCO[b]];
}

/**
 * Percentil dos cenários da faixa. 1,2816 é o desvio-padrão que
 * separa os 10% piores dos 10% melhores.
 */
const Z_FAIXA = 1.2816;

/** 5% piores em um ano isolado — o pior ano típico. */
const Z_PIOR_ANO = 1.6449;

export type Cenario = "pessimista" | "base" | "otimista";

export type PontoProjecao = {
  /** Meses desde o início. */
  mes: number;
  /** Anos desde o início, fracionário. */
  ano: number;
  /** Quanto saiu do bolso até aqui: valor inicial + aportes. */
  investido: number;
  pessimista: number;
  base: number;
  otimista: number;
};

export type Projecao = {
  anos: number;
  pontos: PontoProjecao[];
  /** Último ponto, atalho para a leitura de fim de horizonte. */
  fim: PontoProjecao;
  /** Total que saiu do bolso no período. */
  investido: number;
  /** Taxa anual equivalente de cada cenário no fim do horizonte, em %. */
  taxas: Record<Cenario, number>;
  /** Retorno anual esperado da carteira, em %. */
  retornoEsperado: number;
  /** Volatilidade anual da carteira, em %. */
  volatilidade: number;
  /**
   * Retorno de doze meses ruins (os 5% piores), em %.
   *
   * Pode ser positivo — numa carteira só de renda fixa ele é, e essa
   * é justamente a informação. Existe para que o lado de baixo da
   * faixa tenha um número antes de a pessoa viver isso na prática:
   * "aceito bastante oscilação" é abstrato, "−18% em um ano" não é.
   */
  piorAno: number;
  /** Se os valores estão em poder de compra de hoje. */
  emValorDeHoje: boolean;
  /** Qual premissa dominou a leitura — o análogo de `regra`. */
  premissa: string;
  /**
   * O cenário macro efetivamente usado, e o juro real médio do
   * horizonte. Viaja junto com o resultado para que a tela mostre a
   * premissa DESTA projeção, e não uma tabela genérica ao lado que
   * pode não bater com o número grande.
   */
  macro: Macro;
  juroRealMedio: number;
  /** O que faria esta projeção deixar de valer. */
  invalidaria: string;
};

export type Entradas = {
  fatias: Fatia[];
  /** Valor inicial. */
  inicial: number;
  /** Quanto entra por mês. Zero é válido. */
  aporte: number;
  anos: number;
  /** Descontar a inflação e mostrar em poder de compra de hoje. */
  emValorDeHoje: boolean;
  /**
   * Cenário macro. Só é passado explicitamente em teste — a tela usa
   * o apurado. Sem isso, todo teste da projeção passaria a depender
   * da última rodada do robô, e um teste que muda de resultado
   * conforme o Banco Central publica não é teste.
   */
  macro?: Macro;
};

/** Retorno esperado da carteira: média ponderada simples. */
function retornoDaCarteira(fatias: Fatia[], tabela: Record<ClasseSim, Premissa>): number {
  return fatias.reduce(
    (s, f) => s + (tabela[f.classe].retorno * f.percentual) / 100,
    0,
  );
}

/**
 * Volatilidade da carteira.
 *
 * σ² = ΣΣ wᵢ wⱼ σᵢ σⱼ ρᵢⱼ — a fórmula de verdade, agora com uma matriz
 * de correlação de verdade por trás. É o único lugar onde a
 * diversificação vira número: sem ela, a carteira herdaria a média
 * das oscilações das partes, e misturar classes não teria efeito
 * nenhum além de complicar a tela.
 */
function volDaCarteira(fatias: Fatia[], tabela: Record<ClasseSim, Premissa>): number {
  let variancia = 0;

  for (const a of fatias) {
    for (const b of fatias) {
      const wa = a.percentual / 100;
      const wb = b.percentual / 100;
      variancia +=
        wa * wb * tabela[a.classe].vol * tabela[b.classe].vol * correlacao(a.classe, b.classe);
    }
  }

  return Math.sqrt(Math.max(0, variancia));
}

/**
 * Valor futuro de um aporte inicial mais depósitos mensais, a uma taxa
 * anual constante. Fórmula fechada — sem laço mês a mês, para o
 * gráfico recalcular a cada tecla sem custo.
 */
function valorFuturo(
  inicial: number,
  aporte: number,
  taxaAnual: number,
  meses: number,
): number {
  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;

  // Taxa praticamente nula: a fórmula com divisão por `i` explode.
  if (Math.abs(i) < 1e-9) return inicial + aporte * meses;

  const fator = Math.pow(1 + i, meses);
  return inicial * fator + aporte * ((fator - 1) / i);
}

/**
 * Quanto os depósitos já feitos valem em poder de compra de hoje.
 *
 * Não é a soma nominal dividida pela inflação do horizonte inteiro:
 * o aporte do mês 100 só perdeu cem meses de poder de compra, não
 * dez anos. Deflacionar tudo pelo fator final encolheria o depósito
 * e inflaria o rendimento aparente — exatamente o erro que esta
 * linha existe para impedir.
 */
function investidoEmValorDeHoje(
  inicial: number,
  aporte: number,
  inflacao: number,
  meses: number,
): number {
  if (aporte === 0) return inicial;

  const d = Math.pow(1 + inflacao, 1 / 12) - 1;
  if (Math.abs(d) < 1e-9) return inicial + aporte * meses;

  // Soma de uma progressão geométrica: cada aporte descontado da
  // própria data, não da data final.
  return inicial + (aporte * (1 - Math.pow(1 + d, -meses))) / d;
}

/**
 * Quantidade de pontos do gráfico. Horizonte curto ganha resolução
 * mensal; horizonte longo não precisa de 120 pontos para contar a
 * mesma história e ficaria pesado no traço.
 */
function passos(anos: number): number[] {
  const meses = Math.max(1, Math.round(anos * 12));
  const alvo = 48;
  const salto = Math.max(1, Math.round(meses / alvo));

  const lista: number[] = [];
  for (let m = 0; m <= meses; m += salto) lista.push(m);
  if (lista[lista.length - 1] !== meses) lista.push(meses);
  return lista;
}

/**
 * Projeta a carteira.
 *
 * O modelo é lognormal, o mesmo que qualquer material sério de
 * educação financeira usa para desenhar faixa: o logaritmo do
 * patrimônio caminha com deriva `m` e desvio σ√t. Duas consequências
 * que a tela precisa mostrar, e mostra:
 *
 *   1. A faixa ABRE com o tempo em reais — incerteza acumula.
 *   2. A faixa FECHA com o tempo em taxa anual — é isso que quer
 *      dizer "prazo longo perdoa oscilação", e é a única razão
 *      defensável para aceitar renda variável.
 *
 * Simplificação declarada: com aporte mensal, cada cenário aplica a
 * taxa daquele percentil ao caminho inteiro. Um Monte Carlo daria a
 * distribuição exata do patrimônio com depósitos; a diferença fica
 * bem dentro do erro das próprias premissas, e o resultado aqui
 * continua determinístico — a mesma entrada devolve sempre a mesma
 * faixa, que é o que torna a tela auditável.
 */
export function projetar(e: Entradas): Projecao {
  const inicial = Math.max(0, e.inicial);
  const aporte = Math.max(0, e.aporte);
  const anos = Math.max(1 / 12, e.anos);

  const macro = e.macro ?? macroCorrente();
  const tabela = premissasPara(anos, macro);

  const retornoEsperado = retornoDaCarteira(e.fatias, tabela);
  const vol = volDaCarteira(e.fatias, tabela);

  const mu = retornoEsperado / 100;
  const sigma = vol / 100;
  const infl = e.emValorDeHoje ? macro.ipca / 100 : 0;

  // Deriva do logaritmo. O termo −σ²/2 é o que separa retorno médio de
  // retorno mediano: sem ele, o cenário "base" já viria inflado.
  const m = Math.log(1 + mu) - (sigma * sigma) / 2;

  /** Taxa anual do percentil `z` para um horizonte de `t` anos. */
  const taxa = (z: number, t: number) =>
    Math.exp(m + (z * sigma) / Math.sqrt(t)) - 1;

  const pontos: PontoProjecao[] = passos(anos).map((mes) => {
    const t = Math.max(mes / 12, 1 / 12);
    // Poder de compra: desconta a inflação do próprio horizonte.
    const real = (v: number) => v / Math.pow(1 + infl, mes / 12);

    return {
      mes,
      ano: mes / 12,
      investido: investidoEmValorDeHoje(inicial, aporte, infl, mes),
      pessimista: real(valorFuturo(inicial, aporte, taxa(-Z_FAIXA, t), mes)),
      base: real(valorFuturo(inicial, aporte, taxa(0, t), mes)),
      otimista: real(valorFuturo(inicial, aporte, taxa(Z_FAIXA, t), mes)),
    };
  });

  const fim = pontos[pontos.length - 1];

  const dominante = [...e.fatias].sort((a, b) => b.percentual - a.percentual)[0];
  const nome = dominante ? CLASSES[dominante.classe].nome.toLowerCase() : "carteira";

  return {
    anos,
    pontos,
    fim,
    investido: fim.investido,
    taxas: {
      pessimista: taxa(-Z_FAIXA, anos) * 100,
      base: taxa(0, anos) * 100,
      otimista: taxa(Z_FAIXA, anos) * 100,
    },
    retornoEsperado,
    volatilidade: vol,
    piorAno: (Math.exp(m - Z_PIOR_ANO * sigma) - 1) * 100,
    emValorDeHoje: e.emValorDeHoje,
    macro,
    juroRealMedio: juroRealMedio(macro, anos),
    premissa: `${dominante?.percentual ?? 0}% em ${nome} · oscilação de ${vol.toFixed(0)}% a.a.`,
    invalidaria:
      vol < 3
        ? "Esta faixa é estreita porque a carteira é quase toda de renda fixa. Ela deixa de valer se os juros básicos caírem muito: aqui é a taxa que manda, não a bolsa."
        : "A faixa supõe que você não vende no meio de uma queda. Resgatar durante o cenário de baixo transforma oscilação em prejuízo — é o único jeito de terminar abaixo da linha de baixo.",
  };
}
