import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aplicarReal } from "@/data/gerado/aplicar";
import { numero } from "@/lib/fontes/tipos";
import type { Registro } from "@/lib/fontes/tipos";
import type { ClasseIndicador, Indicador } from "@/types";

/**
 * TESTES DA JUNÇÃO ENTRE DADO REAL E PROTÓTIPO
 *
 * Esta é a costura mais delicada do produto: é onde um número
 * apurado substitui um número inventado. Errar aqui não produz tela
 * quebrada — produz tela plausível e errada, que é pior.
 *
 * Os três casos que quase passaram despercebidos na implementação
 * estão travados abaixo: variação em ponto contra percentual, direção
 * herdada do protótipo, e série curta demais para desenhar.
 */

const base = (over: Partial<Indicador> = {}): Indicador => ({
  id: "teste",
  nome: "Teste",
  sigla: "TST",
  classe: "indice" as ClasseIndicador,
  valor: 100,
  casas: 0,
  variacao: 1,
  variacaoPct: 1,
  direcao: "alta",
  referencia: "fechamento",
  serie: [1, 2, 3, 4, 5],
  explicacao: "x",
  fontes: [{ nome: "Protótipo", publicadoEm: "2020-01-01T00:00:00Z" }],
  natureza: "exemplo",
  ...over,
});

const registro = (over: Partial<Registro> = {}): Registro => ({
  id: "teste",
  valor: 200,
  variacao: 2,
  variacaoPct: 5,
  apuradoEm: "2026-08-19T12:00:00-03:00",
  estado: "novo",
  fonte: { nome: "Banco Central", publicadoEm: "2026-08-19T12:00:00-03:00" },
  ...over,
});

describe("sem dado real", () => {
  it("o indicador de protótipo passa intacto", () => {
    const b = base();
    assert.deepEqual(aplicarReal(b, {}), b);
  });

  it("continua marcado como exemplo, para a tarja não mentir", () => {
    assert.equal(aplicarReal(base(), {}).natureza, "exemplo");
  });
});

describe("com dado real", () => {
  it("substitui número e fonte, e vira apurado", () => {
    const r = aplicarReal(base(), { teste: registro() });

    assert.equal(r.valor, 200);
    assert.equal(r.natureza, "apurado");
    assert.equal(r.fontes[0].nome, "Banco Central");
    assert.equal(r.fontes.length, 1, "fonte de protótipo não pode sobrar junto");
  });

  it("não toca no texto escrito por gente", () => {
    // A regra da sobreposição: dado real substitui NÚMERO, nunca
    // texto. Um número tem procedência verificável; uma frase não.
    const b = base({ nome: "Dólar comercial", explicacao: "explicação humana" });
    const r = aplicarReal(b, { teste: registro() });

    assert.equal(r.nome, b.nome);
    assert.equal(r.explicacao, b.explicacao);
    assert.equal(r.referencia, b.referencia);
  });
});

describe("variação em ponto contra percentual", () => {
  it("juro e inflação variam em PONTOS", () => {
    // IPCA de 4,64% para 4,44% é queda de 0,20 ponto. A conta
    // percentual devolve −4,31%, que o leitor lê como "a inflação
    // caiu 4,3%" — quatro vezes o fato, e na mesma unidade do valor
    // ao lado, o que impede até de desconfiar.
    for (const classe of ["juro", "inflacao"] as ClasseIndicador[]) {
      const r = aplicarReal(base({ classe }), {
        teste: registro({ valor: 4.44, variacao: -0.2, variacaoPct: -4.31 }),
      });
      assert.equal(r.variacaoPct, -0.2, `${classe} deveria variar em ponto`);
    }
  });

  it("índice e moeda variam em percentual", () => {
    for (const classe of ["indice", "moeda", "cripto"] as ClasseIndicador[]) {
      const r = aplicarReal(base({ classe }), {
        teste: registro({ valor: 5.17, variacao: -0.03, variacaoPct: -0.63 }),
      });
      assert.equal(r.variacaoPct, -0.63, `${classe} deveria variar em percentual`);
    }
  });
});

describe("direção", () => {
  it("é recalculada, nunca herdada do protótipo", () => {
    // O protótipo trazia "alta" digitado. Número novo com seta velha
    // é pior que qualquer um dos dois sozinho.
    const subindo = base({ direcao: "alta" });

    assert.equal(
      aplicarReal(subindo, { teste: registro({ variacaoPct: -2 }) }).direcao,
      "baixa",
    );
    assert.equal(
      aplicarReal(subindo, { teste: registro({ variacaoPct: 2 }) }).direcao,
      "alta",
    );
  });

  it("variação desprezível é estável, não alta", () => {
    const r = aplicarReal(base(), { teste: registro({ variacaoPct: 0.0001 }) });
    assert.equal(r.direcao, "estavel");
  });
});

describe("série do sparkline", () => {
  it("usa a real quando ela tem pontos suficientes", () => {
    const serie = [1, 2, 3, 4];
    const r = aplicarReal(base(), { teste: registro({ serie }) });
    assert.deepEqual(r.serie, serie);
  });

  it("mantém a do protótipo quando a real é curta demais", () => {
    // Dois pontos desenham uma reta que afirma uma tendência que o
    // dado não tem.
    const b = base();
    for (const curta of [undefined, [], [7], [7, 8]]) {
      const r = aplicarReal(b, { teste: registro({ serie: curta }) });
      assert.deepEqual(r.serie, b.serie, `série ${JSON.stringify(curta)}`);
    }
  });
});

describe("números vindos de JSON de terceiro", () => {
  it("aceita string com ponto e com vírgula", () => {
    assert.equal(numero("14.25"), 14.25);
    assert.equal(numero("14,25"), 14.25);
  });

  it("recusa o que não é número, em vez de virar NaN", () => {
    // Um Number(x) solto transforma tudo isto em NaN, e o NaN chega
    // ao gráfico como buraco silencioso.
    for (const x of ["", "   ", null, undefined, {}, [], "abc", NaN, Infinity]) {
      assert.equal(numero(x), null, `${JSON.stringify(x)} deveria virar null`);
    }
  });

  it("aceita zero e negativo, que são valores legítimos", () => {
    assert.equal(numero(0), 0);
    assert.equal(numero("0"), 0);
    assert.equal(numero("-0.35"), -0.35);
  });
});
