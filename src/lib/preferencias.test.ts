import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { INTERESSES, sanearInteresses } from "@/lib/preferencias";

/**
 * O que está no `localStorage` veio de outra aba, de uma versão
 * anterior do site ou de alguém editando à mão — não é entrada
 * confiável. Estes casos travam o contrato: sai daqui uma lista de
 * temas válidos, ou sai vazio. Nunca sai `undefined` dentro do array,
 * que era o que chegava aos mapas de filtro da página.
 */
describe("sanearInteresses", () => {
  it("aceita uma lista válida", () => {
    assert.deepEqual(sanearInteresses('["acoes","fiis"]'), ["acoes", "fiis"]);
  });

  it("descarta tema que não existe mais", () => {
    assert.deepEqual(sanearInteresses('["acoes","tema-de-2019"]'), ["acoes"]);
  });

  it("descarta valor que nem string é", () => {
    assert.deepEqual(sanearInteresses('["acoes",42,null,{"a":1}]'), ["acoes"]);
  });

  it("devolve vazio para JSON quebrado", () => {
    assert.deepEqual(sanearInteresses("{isso não é json"), []);
  });

  it("devolve vazio para JSON válido que não é lista", () => {
    assert.deepEqual(sanearInteresses('{"interesses":["acoes"]}'), []);
    assert.deepEqual(sanearInteresses('"acoes"'), []);
  });

  it("devolve vazio para storage ausente", () => {
    assert.deepEqual(sanearInteresses(null), []);
    assert.deepEqual(sanearInteresses(""), []);
  });

  it("normaliza a ordem, para o snapshot não depender do clique", () => {
    assert.deepEqual(
      sanearInteresses('["fiis","acoes"]'),
      sanearInteresses('["acoes","fiis"]'),
    );
  });

  it("a mesma referência volta quando não há nada escolhido", () => {
    // `useSyncExternalStore` compara snapshots por identidade: um `[]`
    // novo a cada leitura colocaria o React em loop de render.
    assert.equal(sanearInteresses(null), sanearInteresses("[]"));
  });

  it("todo tema declarado é aceito", () => {
    assert.deepEqual(sanearInteresses(JSON.stringify(INTERESSES)), [
      ...INTERESSES,
    ]);
  });
});
