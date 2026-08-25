import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CLASSES,
  simular,
  type ClasseSim,
  type Prazo,
  type Respostas,
  type Tolerancia,
} from "@/lib/simulador";

/**
 * TESTES DO MOTOR
 *
 * O README chama o simulador de determinístico, testável e auditável.
 * Sem teste, "auditável" é adjetivo. Estes casos travam exatamente as
 * quatro regras de precedência descritas lá — se alguém trocar a
 * matriz de percentuais (que é placeholder e vai mudar), o que não
 * pode mudar continua verificado.
 *
 * Roda com o runner do próprio Node:  npm test
 */

const PRAZOS: Prazo[] = ["ate1", "1a3", "3a5", "mais5"];
const TOLERANCIAS: Tolerancia[] = ["seguranca", "alguma", "bastante"];

/** Todas as combinações possíveis de resposta, para as invariantes. */
function todasAsRespostas(valor: number): Respostas[] {
  return PRAZOS.flatMap((prazo) =>
    TOLERANCIAS.flatMap((tolerancia) =>
      (["sim", "nao"] as const).map((reserva) => ({
        valor,
        prazo,
        tolerancia,
        reserva,
      })),
    ),
  );
}

const VARIAVEIS: ClasseSim[] = ["etf-brasil", "etf-exterior", "fii", "acoes"];

describe("invariantes — valem para qualquer resposta", () => {
  for (const valor of [500, 10_000, 250_000]) {
    it(`as fatias somam 100% e somam o total (R$ ${valor})`, () => {
      for (const r of todasAsRespostas(valor)) {
        const res = simular(r);
        const pct = res.fatias.reduce((s, f) => s + f.percentual, 0);
        const soma = res.fatias.reduce((s, f) => s + f.valor, 0);

        assert.equal(pct, 100, `percentuais de ${JSON.stringify(r)}`);
        // O centavo do arredondamento vai para a última fatia: a barra
        // precisa fechar no valor que a pessoa digitou.
        assert.equal(soma, res.total, `valores de ${JSON.stringify(r)}`);
      }
    });
  }

  it("toda saída é auditável: regra, justificativa e invalidação", () => {
    for (const r of todasAsRespostas(10_000)) {
      const res = simular(r);
      assert.match(res.regra, /^R[1-4] · /);
      assert.ok(res.justificativa.trim().length > 0);
      assert.ok(res.invalidaria.trim().length > 0);
      for (const f of res.fatias) {
        assert.ok(f.porque.trim().length > 0, `${f.classe} sem "porque"`);
      }
    }
  });

  it("é determinístico: mesma entrada, mesma saída", () => {
    for (const r of todasAsRespostas(7_777)) {
      assert.deepEqual(simular(r), simular(r));
    }
  });

  it("nenhuma fatia aponta para classe desconhecida", () => {
    for (const r of todasAsRespostas(10_000)) {
      for (const f of simular(r).fatias) {
        assert.ok(CLASSES[f.classe], `classe ${f.classe} sem definição`);
      }
    }
  });
});

describe("R1 — sem reserva de emergência vence tudo", () => {
  it("manda 100% para liquidez diária, inclusive para quem aceita risco", () => {
    for (const r of todasAsRespostas(50_000).filter((x) => x.reserva === "nao")) {
      const res = simular(r);
      assert.equal(res.regra, "R1 · sem reserva de emergência");
      assert.deepEqual(
        res.fatias.map((f) => f.classe),
        ["reserva"],
      );
      assert.equal(res.fatias[0].valor, 50_000);
    }
  });
});

describe("R2 — prazo curto sobrepõe apetite por risco", () => {
  it("não coloca renda variável em dinheiro de menos de um ano", () => {
    for (const tolerancia of TOLERANCIAS) {
      const res = simular({
        valor: 50_000,
        prazo: "ate1",
        tolerancia,
        reserva: "sim",
      });
      const variavel = res.fatias.filter((f) => VARIAVEIS.includes(f.classe));
      assert.deepEqual(variavel, [], `tolerância ${tolerancia}`);
      assert.equal(res.resumo.emRendaVariavel, 0);
    }
  });

  it("explica a contradição em vez de ignorar a resposta", () => {
    const res = simular({
      valor: 50_000,
      prazo: "ate1",
      tolerancia: "bastante",
      reserva: "sim",
    });
    assert.equal(res.regra, "R2 · prazo curto sobrepõe tolerância a risco");
    assert.match(res.justificativa, /prazo manda/);
  });

  it("não acusa contradição de quem escolheu segurança", () => {
    const res = simular({
      valor: 50_000,
      prazo: "ate1",
      tolerancia: "seguranca",
      reserva: "sim",
    });
    assert.notEqual(res.regra, "R2 · prazo curto sobrepõe tolerância a risco");
  });
});

describe("R3 — abaixo do piso, uma fatia só", () => {
  it("não fraciona R$ 200", () => {
    const res = simular({
      valor: 200,
      prazo: "mais5",
      tolerancia: "bastante",
      reserva: "sim",
    });
    assert.equal(res.fatias.length, 1);
    assert.equal(res.regra, "R3 · valor abaixo do piso para fracionar");
    assert.equal(res.fatias[0].valor, 200);
  });

  it("fraciona a partir do piso", () => {
    const res = simular({
      valor: 300,
      prazo: "mais5",
      tolerancia: "bastante",
      reserva: "sim",
    });
    assert.ok(res.fatias.length > 1);
    assert.equal(res.regra, "R4 · matriz por tolerância e prazo");
  });
});

describe("R4 — matriz por tolerância e prazo", () => {
  it("mais tolerância a risco nunca diminui a renda variável", () => {
    for (const prazo of PRAZOS) {
      const base = { valor: 100_000, prazo, reserva: "sim" } as const;
      const seg = simular({ ...base, tolerancia: "seguranca" }).resumo;
      const alg = simular({ ...base, tolerancia: "alguma" }).resumo;
      const bas = simular({ ...base, tolerancia: "bastante" }).resumo;

      assert.ok(seg.emRendaVariavel <= alg.emRendaVariavel, `prazo ${prazo}`);
      assert.ok(alg.emRendaVariavel <= bas.emRendaVariavel, `prazo ${prazo}`);
    }
  });

  it("prazo mais longo nunca diminui a renda variável", () => {
    for (const tolerancia of TOLERANCIAS) {
      const base = { valor: 100_000, tolerancia, reserva: "sim" } as const;
      const curto = simular({ ...base, prazo: "ate1" }).resumo;
      const medio = simular({ ...base, prazo: "1a3" }).resumo;
      const longo = simular({ ...base, prazo: "mais5" }).resumo;

      assert.ok(curto.emRendaVariavel <= medio.emRendaVariavel, tolerancia);
      assert.ok(medio.emRendaVariavel <= longo.emRendaVariavel, tolerancia);
    }
  });
});

describe("resumo agregado", () => {
  it("percentuais do resumo ficam entre 0 e 100", () => {
    for (const r of todasAsRespostas(10_000)) {
      const { liquidoRapido, protegidoInflacao, emRendaVariavel } =
        simular(r).resumo;
      for (const p of [liquidoRapido, protegidoInflacao, emRendaVariavel]) {
        assert.ok(p >= 0 && p <= 100, JSON.stringify(r));
      }
    }
  });

  it("carteira só de reserva é risco baixo e 100% líquida", () => {
    const res = simular({
      valor: 10_000,
      prazo: "ate1",
      tolerancia: "seguranca",
      reserva: "sim",
    });
    assert.equal(res.resumo.riscoPonderado, "baixo");
    assert.equal(res.resumo.liquidoRapido, 100);
  });
});

describe("entradas de borda", () => {
  it("valor negativo vira zero em vez de fatia negativa", () => {
    const res = simular({
      valor: -1_000,
      prazo: "mais5",
      tolerancia: "alguma",
      reserva: "sim",
    });
    assert.equal(res.total, 0);
    for (const f of res.fatias) assert.ok(f.valor >= 0);
  });

  it("valor quebrado não vaza centavo do total", () => {
    const res = simular({
      valor: 1_999.77,
      prazo: "mais5",
      tolerancia: "alguma",
      reserva: "sim",
    });
    assert.equal(res.total, 2_000);
    assert.equal(
      res.fatias.reduce((s, f) => s + f.valor, 0),
      2_000,
    );
  });
});
