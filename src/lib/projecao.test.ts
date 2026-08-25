import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { simular, type Prazo, type Tolerancia } from "@/lib/simulador";
import {
  ANOS_CONVERGENCIA,
  correlacao,
  juroRealMedio,
  macroCorrente,
  premissasPublicas,
  projetar,
  type Entradas,
  type Macro,
} from "@/lib/projecao";
import type { ClasseSim } from "@/lib/simulador";

/**
 * TESTES DA PROJEÇÃO
 *
 * Projeção é a parte do produto mais fácil de transformar em promessa
 * sem querer. O que estes casos travam não são os números — as
 * premissas são placeholders e vão mudar — e sim as propriedades que
 * não podem mudar junto com elas:
 *
 *   · a ordem dos cenários nunca se inverte;
 *   · a faixa abre em reais e fecha em taxa anual;
 *   · o dinheiro depositado sempre aparece separado do rendimento;
 *   · mesma entrada, mesma saída.
 *
 * Roda com o runner do próprio Node:  npm test
 */

const PRAZOS: Prazo[] = ["ate1", "1a3", "3a5", "mais5"];
const TOLERANCIAS: Tolerancia[] = ["seguranca", "alguma", "bastante"];

function carteira(tolerancia: Tolerancia, prazo: Prazo) {
  return simular({ valor: 10000, prazo, tolerancia, reserva: "sim" }).fatias;
}

/**
 * Macro fixo para os testes.
 *
 * Sem isto, todo caso da projeção passaria a depender da última
 * rodada do robô diário — e um teste cujo resultado muda quando o
 * Copom se reúne não testa nada. O comportamento com dado real é
 * verificado à parte, no bloco "cenário macro apurado".
 */
const MACRO_TESTE: Macro = {
  ipca: 4.5,
  juroRealCorrente: 4.0,
  juroRealNeutro: 4.0,
};

const padrao = (p: Partial<Entradas> = {}): Entradas => ({
  fatias: carteira("alguma", "mais5"),
  inicial: 10000,
  aporte: 300,
  anos: 10,
  emValorDeHoje: false,
  macro: MACRO_TESTE,
  ...p,
});

/** Todas as carteiras que o simulador consegue produzir. */
function todasAsCarteiras() {
  return PRAZOS.flatMap((prazo) =>
    TOLERANCIAS.map((t) => ({ nome: `${t}/${prazo}`, fatias: carteira(t, prazo) })),
  );
}

describe("ordem dos cenários", () => {
  it("pessimista ≤ base ≤ otimista em todo ponto de toda carteira", () => {
    for (const { nome, fatias } of todasAsCarteiras()) {
      const p = projetar(padrao({ fatias }));
      for (const ponto of p.pontos) {
        assert.ok(
          ponto.pessimista <= ponto.base + 1e-6,
          `${nome}: pessimista acima do base no mês ${ponto.mes}`,
        );
        assert.ok(
          ponto.base <= ponto.otimista + 1e-6,
          `${nome}: base acima do otimista no mês ${ponto.mes}`,
        );
      }
    }
  });

  it("as taxas anuais respeitam a mesma ordem", () => {
    const { taxas } = projetar(padrao());
    assert.ok(taxas.pessimista < taxas.base);
    assert.ok(taxas.base < taxas.otimista);
  });
});

describe("forma da faixa", () => {
  it("abre em reais: a distância entre os extremos cresce com o tempo", () => {
    const { pontos } = projetar(padrao({ aporte: 0 }));
    const largura = pontos.map((x) => x.otimista - x.pessimista);

    for (let i = 1; i < largura.length; i++) {
      assert.ok(
        largura[i] >= largura[i - 1] - 1e-6,
        `faixa estreitou em reais no ponto ${i}`,
      );
    }
  });

  it("fecha em taxa anual: horizonte maior tem faixa de taxa menor", () => {
    const curto = projetar(padrao({ anos: 2 }));
    const longo = projetar(padrao({ anos: 20 }));

    const abertura = (p: typeof curto) => p.taxas.otimista - p.taxas.pessimista;
    assert.ok(
      abertura(longo) < abertura(curto),
      "prazo longo deveria estreitar a faixa de taxa anual",
    );
  });

  it("o pior ano da carteira arrojada é uma queda de verdade", () => {
    const arrojada = projetar(padrao({ fatias: carteira("bastante", "mais5") }));
    const conservadora = projetar(padrao({ fatias: carteira("seguranca", "ate1") }));

    assert.ok(arrojada.piorAno < 0, "renda variável sem ano ruim negativo");
    assert.ok(conservadora.piorAno > 0, "reserva não deveria cair em 12 meses");
  });

  it("carteira conservadora tem faixa mais estreita que a arrojada", () => {
    const conservadora = projetar(
      padrao({ fatias: carteira("seguranca", "mais5") }),
    );
    const arrojada = projetar(padrao({ fatias: carteira("bastante", "mais5") }));

    assert.ok(conservadora.volatilidade < arrojada.volatilidade);
    assert.ok(
      conservadora.taxas.otimista - conservadora.taxas.pessimista <
        arrojada.taxas.otimista - arrojada.taxas.pessimista,
    );
  });

  it("diversificar oscila menos que a média das partes", () => {
    // A carteira mista tem ações, mas não pode herdar a volatilidade
    // cheia delas — é o efeito que justifica a fatia de exterior.
    const mista = projetar(padrao({ fatias: carteira("bastante", "mais5") }));
    assert.ok(mista.volatilidade < 26, "carteira mista com vol de ação pura");
  });
});

describe("dinheiro depositado", () => {
  it("a linha do investido é exatamente inicial + aportes", () => {
    const p = projetar(padrao({ inicial: 5000, aporte: 250, anos: 4 }));
    assert.equal(p.fim.investido, 5000 + 250 * 48);
  });

  it("sem aporte, o investido não se move", () => {
    const p = projetar(padrao({ aporte: 0, inicial: 1000 }));
    for (const ponto of p.pontos) assert.equal(ponto.investido, 1000);
  });

  it("o mês zero vale o valor inicial em todos os cenários", () => {
    const p = projetar(padrao({ inicial: 7000 }));
    const zero = p.pontos[0];
    assert.equal(zero.mes, 0);
    for (const v of [zero.pessimista, zero.base, zero.otimista, zero.investido]) {
      assert.equal(Math.round(v), 7000);
    }
  });

  it("valor zero e aporte zero não produzem NaN", () => {
    const p = projetar(padrao({ inicial: 0, aporte: 0 }));
    for (const ponto of p.pontos) {
      for (const v of [ponto.investido, ponto.pessimista, ponto.base, ponto.otimista]) {
        assert.ok(Number.isFinite(v));
      }
    }
  });
});

describe("poder de compra", () => {
  it("em valor de hoje é sempre menor que o nominal", () => {
    const nominal = projetar(padrao({ emValorDeHoje: false }));
    const real = projetar(padrao({ emValorDeHoje: true }));

    assert.ok(real.fim.base < nominal.fim.base);
    // A taxa é a mesma: a conversão é do patrimônio, não do retorno.
    assert.equal(real.taxas.base, nominal.taxas.base);
  });

  it("desconta cada aporte da própria data, não do fim do horizonte", () => {
    const real = projetar(
      padrao({ inicial: 0, aporte: 1000, anos: 10, emValorDeHoje: true }),
    );

    // Nominal: 120 mil. Deflacionar tudo pelo fator de dez anos daria
    // ~77 mil e inventaria rendimento que não houve. O certo fica
    // perto de 96 mil — cada depósito perde só o tempo que viveu.
    assert.ok(
      real.fim.investido > 90_000 && real.fim.investido < 100_000,
      `investido real fora da faixa esperada: ${real.fim.investido}`,
    );
  });

  it("o valor inicial não é descontado: ele foi depositado hoje", () => {
    const real = projetar(
      padrao({ inicial: 10_000, aporte: 0, emValorDeHoje: true }),
    );
    for (const p of real.pontos) assert.equal(p.investido, 10_000);
  });

  it("desconta também a linha do investido", () => {
    const real = projetar(padrao({ emValorDeHoje: true }));
    const nominal = projetar(padrao({ emValorDeHoje: false }));
    assert.ok(
      real.fim.investido < nominal.fim.investido,
      "dinheiro depositado hoje e daqui a 10 anos não valem o mesmo",
    );
  });
});

describe("determinismo", () => {
  it("a mesma entrada devolve sempre a mesma faixa", () => {
    const a = projetar(padrao());
    const b = projetar(padrao());
    assert.deepEqual(a.pontos, b.pontos);
    assert.deepEqual(a.taxas, b.taxas);
  });

  it("toda carteira declara pior ano, premissa e invalidaria", () => {
    for (const { nome, fatias } of todasAsCarteiras()) {
      const p = projetar(padrao({ fatias }));
      // O pior ano NÃO é sempre negativo: numa carteira só de renda
      // fixa ele é positivo, e é essa a informação. O que ele nunca
      // pode ser é maior que o retorno esperado.
      assert.ok(
        p.piorAno < p.retornoEsperado,
        `${nome}: pior ano acima do retorno esperado`,
      );
      assert.ok(p.premissa.length > 0, `${nome}: sem premissa declarada`);
      assert.ok(p.invalidaria.length > 0, `${nome}: sem invalidaria`);
    }
  });
});


/* ================================================================
   AS PREMISSAS

   Estes casos não travam os números — eles são placeholders e vão
   mudar quando alguém habilitado revisar. Travam as PROPRIEDADES que
   qualquer revisão teria de preservar. Se um dia a tabela for
   substituída e um destes quebrar, o substituto tem um defeito que
   este arquivo já sabia nomear.
   ================================================================ */

const CLASSES_TODAS: ClasseSim[] = [
  "reserva",
  "tesouro-ipca",
  "fii",
  "etf-exterior",
  "etf-brasil",
  "acoes",
];

describe("escada de risco e retorno", () => {
  it("nunca paga menos por oscilar mais", () => {
    // O defeito da versão anterior: tesouro-ipca rendia menos que a
    // reserva com sete vezes a oscilação. Uma premissa assim faz o
    // motor recomendar contra si mesmo.
    const escada = premissasPublicas(10, MACRO_TESTE);

    for (let i = 1; i < escada.length; i++) {
      assert.ok(
        escada[i].retorno > escada[i - 1].retorno,
        `${escada[i].nome} oscila mais que ${escada[i - 1].nome} e rende menos ou igual`,
      );
    }
  });

  it("toda classe rende ao menos a inflação assumida", () => {
    for (const p of premissasPublicas(10, MACRO_TESTE)) {
      assert.ok(
        p.retorno > MACRO_TESTE.ipca,
        `${p.nome} perderia para a inflação por premissa`,
      );
    }
  });

  it("toda classe declara de onde veio o retorno", () => {
    for (const p of premissasPublicas(10, MACRO_TESTE)) {
      assert.ok(p.base.length > 0, `${p.nome} sem premissa declarada`);
      assert.ok(p.vol > 0, `${p.nome} sem oscilação`);
    }
  });

  it("concentrar em ações não é pago como se fosse", () => {
    // Risco específico some com diversificação. O que some de graça
    // ninguém paga para carregar: ações individuais podem render um
    // pouco mais que o ETF, nunca na proporção da oscilação a mais.
    const p = premissasPublicas(10, MACRO_TESTE);
    const etf = p.find((x) => x.classe === "etf-brasil")!;
    const acoes = p.find((x) => x.classe === "acoes")!;

    const maisRetorno = (acoes.retorno - etf.retorno) / etf.retorno;
    const maisVol = (acoes.vol - etf.vol) / etf.vol;

    assert.ok(acoes.vol > etf.vol, "ações deveriam oscilar mais que o índice");
    assert.ok(
      maisRetorno < maisVol / 2,
      "o retorno extra de concentrar está alto demais para o risco extra",
    );
  });
});

describe("a escada chega até a carteira", () => {
  it("mais tolerância a risco paga mais no prazo longo", () => {
    // A propriedade que quebrou em silêncio na primeira calibragem:
    // as premissas por classe estavam numa escada correta, e mesmo
    // assim as três carteiras terminavam dez anos empatadas em
    // ~11%, porque o arrasto da volatilidade comia o prêmio. O motor
    // contradizia a regra R4 do simulador sem que nada acusasse.
    const taxa = (t: Tolerancia) =>
      projetar(padrao({ fatias: carteira(t, "mais5"), anos: 10 })).taxas.base;

    assert.ok(
      taxa("alguma") > taxa("seguranca"),
      "aceitar alguma oscilação não pagou nada a mais que evitar",
    );
    assert.ok(
      taxa("bastante") > taxa("alguma"),
      "aceitar bastante oscilação não pagou nada a mais que alguma",
    );
  });

  it("e cobra mais caro no ano ruim", () => {
    // O outro lado do mesmo acordo. Se só o retorno subisse, a tela
    // estaria vendendo risco sem mostrar o preço.
    const pior = (t: Tolerancia) =>
      projetar(padrao({ fatias: carteira(t, "mais5") })).piorAno;

    assert.ok(pior("alguma") < pior("seguranca"));
    assert.ok(pior("bastante") < pior("alguma"));
  });
});

describe("matriz de correlação", () => {
  it("é simétrica e vale 1 na diagonal", () => {
    for (const a of CLASSES_TODAS) {
      assert.equal(correlacao(a, a), 1, `${a} consigo mesma`);
      for (const b of CLASSES_TODAS) {
        assert.equal(correlacao(a, b), correlacao(b, a), `${a}×${b} assimétrica`);
      }
    }
  });

  it("fica dentro de −1 e 1", () => {
    for (const a of CLASSES_TODAS) {
      for (const b of CLASSES_TODAS) {
        const r = correlacao(a, b);
        assert.ok(r >= -1 && r <= 1, `${a}×${b} fora da faixa: ${r}`);
      }
    }
  });

  it("é positiva semidefinida — ou seja, é uma matriz possível", () => {
    // Nem todo conjunto de correlações plausíveis uma a uma descreve
    // um mundo que existe: dá para escrever três pares coerentes e um
    // trio impossível. Cholesky é o teste padrão — se ele completa, a
    // matriz descreve um mundo possível e nenhuma carteira pode ter
    // variância negativa.
    const n = CLASSES_TODAS.length;
    const m = CLASSES_TODAS.map((a) => CLASSES_TODAS.map((b) => correlacao(a, b)));
    const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let soma = m[i][j];
        for (let k = 0; k < j; k++) soma -= L[i][k] * L[j][k];

        if (i === j) {
          assert.ok(
            soma > -1e-9,
            `matriz impossível: pivô negativo em ${CLASSES_TODAS[i]}`,
          );
          L[i][j] = Math.sqrt(Math.max(0, soma));
        } else {
          L[i][j] = L[j][j] === 0 ? 0 : soma / L[j][j];
        }
      }
    }
  });

  it("o exterior é o que menos acompanha a bolsa brasileira", () => {
    // É a razão de existir da fatia, e o texto da classe promete isso
    // ao leitor. O motor precisa saber.
    const comBolsa = (c: ClasseSim) => correlacao(c, "etf-brasil");

    assert.ok(
      comBolsa("etf-exterior") < comBolsa("fii"),
      "exterior deveria descolar mais da bolsa local que o fundo imobiliário",
    );
    assert.ok(
      comBolsa("etf-exterior") < comBolsa("acoes"),
      "exterior deveria descolar mais da bolsa local que ações brasileiras",
    );
  });

  it("diversificar entre blocos reduz oscilação de verdade", () => {
    // Meio a meio entre bolsa brasileira e exterior tem de oscilar
    // menos que a média das duas. Se não reduzir, a fatia de exterior
    // é decoração.
    const meioAMeio = projetar(
      padrao({
        fatias: [
          { classe: "etf-brasil", percentual: 50, valor: 5000, porque: "" },
          { classe: "etf-exterior", percentual: 50, valor: 5000, porque: "" },
        ],
      }),
    );
    const soBrasil = projetar(
      padrao({
        fatias: [
          { classe: "etf-brasil", percentual: 100, valor: 10000, porque: "" },
        ],
      }),
    );
    const soExterior = projetar(
      padrao({
        fatias: [
          { classe: "etf-exterior", percentual: 100, valor: 10000, porque: "" },
        ],
      }),
    );

    const media = (soBrasil.volatilidade + soExterior.volatilidade) / 2;
    assert.ok(
      meioAMeio.volatilidade < media,
      `misturar não reduziu oscilação: ${meioAMeio.volatilidade} vs média ${media}`,
    );
  });
});


/* ================================================================
   CONVERGÊNCIA DO JURO

   O defeito que estes casos existem para impedir: a página mostrando
   Selic de 14% e a projeção, no mesmo scroll, dizendo que a reserva
   rende 8,68% ao ano. Nenhum leitor precisa saber o que é juro
   neutro para ver que uma das duas está errada.
   ================================================================ */

describe("convergência do juro real", () => {
  const alto: Macro = { ipca: 4.5, juroRealCorrente: 9.0, juroRealNeutro: 4.0 };

  it("no curtíssimo prazo fica perto do juro de hoje", () => {
    const m = juroRealMedio(alto, 1 / 12);
    assert.ok(
      Math.abs(m - alto.juroRealCorrente) < 0.2,
      `um mês deveria valer o juro corrente, veio ${m}`,
    );
  });

  it("no prazo longo fica perto do neutro", () => {
    const m = juroRealMedio(alto, 30);
    assert.ok(
      Math.abs(m - alto.juroRealNeutro) < 0.5,
      `trinta anos deveriam tender ao neutro, veio ${m}`,
    );
  });

  it("cai de forma monótona conforme o prazo cresce", () => {
    let anterior = Infinity;
    for (const anos of [0.5, 1, 2, 3, 5, 10, 20, 30]) {
      const m = juroRealMedio(alto, anos);
      assert.ok(m <= anterior + 1e-9, `subiu de ${anterior} para ${m} em ${anos}a`);
      anterior = m;
    }
  });

  it("nunca sai do intervalo entre o corrente e o neutro", () => {
    for (const anos of [0.1, 1, 3, 7, 50]) {
      const m = juroRealMedio(alto, anos);
      assert.ok(
        m <= alto.juroRealCorrente + 1e-9 && m >= alto.juroRealNeutro - 1e-9,
        `${anos}a devolveu ${m}, fora do intervalo`,
      );
    }
  });

  it("juro parado não converge para lugar nenhum", () => {
    // Quando corrente e neutro são iguais, a média tem de ser esse
    // valor em qualquer prazo — senão a convergência estaria
    // inventando movimento onde não há.
    const parado: Macro = { ipca: 4.5, juroRealCorrente: 5, juroRealNeutro: 5 };
    for (const anos of [0.25, 1, ANOS_CONVERGENCIA, 40]) {
      assert.ok(Math.abs(juroRealMedio(parado, anos) - 5) < 1e-9);
    }
  });

  it("a reserva de um ano acompanha a Selic que está na tela", () => {
    // O caso concreto do defeito. Com juro real corrente de 9%, a
    // reserva em doze meses tem de render perto da Selic nominal,
    // não do que ela valeria daqui a uma década.
    const selicNominal = ((1 + 9 / 100) * (1 + 4.5 / 100) - 1) * 100;
    const umAno = premissasPublicas(1, alto).find((x) => x.classe === "reserva")!;

    assert.ok(
      Math.abs(umAno.retorno - selicNominal) < 1.5,
      `reserva de um ano em ${umAno.retorno}% contra Selic de ${selicNominal}%`,
    );
  });

  it("e a de dez anos não promete a Selic de hoje para sempre", () => {
    const dezAnos = premissasPublicas(10, alto).find((x) => x.classe === "reserva")!;
    const umAno = premissasPublicas(1, alto).find((x) => x.classe === "reserva")!;

    assert.ok(
      dezAnos.retorno < umAno.retorno - 1,
      "dez anos deveriam render bem menos que um ano com juro contracionista",
    );
  });
});

describe("cenário macro apurado", () => {
  it("sai do dado real quando ele existe, sem quebrar quando não existe", () => {
    // Não trava valor: o número muda quando o Copom se reúne. Trava
    // que o cenário é utilizável — sem NaN, sem inflação negativa,
    // sem juro absurdo — venha ele do Banco Central ou do padrão.
    const m = macroCorrente();

    for (const [nome, v] of Object.entries(m)) {
      assert.ok(Number.isFinite(v), `${nome} não é número finito: ${v}`);
    }
    assert.ok(m.ipca > 0 && m.ipca < 50, `inflação fora do razoável: ${m.ipca}`);
    assert.ok(
      m.juroRealCorrente > -10 && m.juroRealCorrente < 30,
      `juro real fora do razoável: ${m.juroRealCorrente}`,
    );
    assert.equal(m.juroRealNeutro, 4.0);
  });
});
