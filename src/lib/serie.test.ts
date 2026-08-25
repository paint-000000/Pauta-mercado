import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { caminho, gerarSerie } from "@/lib/serie";

/**
 * A série existe para não haver divergência de hidratação: servidor e
 * cliente precisam desenhar o mesmo caminho de SVG. O que garante isso
 * é o gerador ser determinístico e o último ponto bater com a cotação
 * impressa ao lado — um sparkline que termina em outro lugar contradiz
 * o número na mesma linha.
 */
describe("gerarSerie", () => {
  it("mesma semente devolve exatamente a mesma série", () => {
    assert.deepEqual(
      gerarSerie("PETR4", 38.42, 1.8),
      gerarSerie("PETR4", 38.42, 1.8),
    );
  });

  it("sementes diferentes divergem", () => {
    assert.notDeepEqual(
      gerarSerie("PETR4", 38.42, 1.8),
      gerarSerie("VALE3", 38.42, 1.8),
    );
  });

  it("termina no valor atual e começa no valor implícito pela variação", () => {
    const fim = 129_450;
    const variacao = 1.24;
    const s = gerarSerie("IBOV", fim, variacao);

    assert.equal(s.at(-1), fim);
    assert.ok(Math.abs(s[0] - fim / (1 + variacao / 100)) < 1e-6);
  });

  it("respeita a quantidade de pontos pedida", () => {
    assert.equal(gerarSerie("X", 10, 1, 8).length, 8);
  });

  it("não produz NaN quando a variação é zero", () => {
    for (const v of gerarSerie("ESTAVEL", 100, 0)) {
      assert.ok(Number.isFinite(v));
    }
  });
});

describe("caminho", () => {
  it("devolve vazio para série curta demais para virar linha", () => {
    assert.equal(caminho([], 100, 28), "");
    assert.equal(caminho([1], 100, 28), "");
  });

  it("mapeia o primeiro e o último ponto nas bordas da caixa", () => {
    const d = caminho([1, 2, 3], 100, 28);
    assert.ok(d.startsWith("M0.00,"));
    assert.match(d, /L100\.00,/);
  });

  it("inverte o eixo: valor maior fica mais alto na tela", () => {
    // SVG cresce para baixo, então o maior valor tem o menor y.
    const ys = [...caminho([1, 5], 10, 10).matchAll(/[ML][\d.]+,([\d.]+)/g)].map(
      (m) => Number(m[1]),
    );
    assert.deepEqual(ys, [10, 0]);
  });

  it("série constante não divide por zero", () => {
    for (const n of caminho([5, 5, 5], 100, 28).match(/-?\d+\.\d+/g) ?? []) {
      assert.ok(Number.isFinite(Number(n)));
    }
  });
});
