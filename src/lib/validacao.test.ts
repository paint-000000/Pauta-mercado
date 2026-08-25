import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { numeroCravadoNaProsa, valoresOrfaos } from "@/lib/validacao";
import { resolverValor, valoresReferenciados } from "@/lib/interpolar";
import { idadeEmDias } from "@/lib/datas";

/**
 * TESTES DAS REGRAS DE CONTEÚDO
 *
 * A regra do número cravado nasceu de um defeito real: a edição
 * dizia que a Selic estava em 10,50% enquanto a faixa do topo, três
 * centímetros acima, mostrava 14,00% vinda do Banco Central.
 *
 * O que estes casos protegem não é a regra achar o defeito — isso
 * ela já faz. É a FRONTEIRA dela. A primeira versão marcava qualquer
 * número perto da menção e acusou "Travar IPCA mais 6%", onde o 6% é
 * juro real somado, não o valor do índice. Regra que grita à toa é
 * desligada, e regra desligada não pega o caso de verdade.
 */

describe("conteúdo atual passa nas regras", () => {
  it("nenhum número apurado está cravado na prosa", () => {
    const p = numeroCravadoNaProsa();
    assert.deepEqual(p, [], JSON.stringify(p, null, 1));
  });

  it("nenhum {{valor}} aponta para indicador inexistente", () => {
    assert.deepEqual(valoresOrfaos(), []);
  });
});

describe("marcação de valor", () => {
  it("reconhece as duas formas", () => {
    assert.deepEqual(valoresReferenciados("a {{selic}} e o {{ibovespa.var}}"), [
      "selic",
      "ibovespa",
    ]);
  });

  it("ignora texto sem marcação", () => {
    assert.deepEqual(valoresReferenciados("Selic em 10,50%"), []);
  });

  it("resolve indicador existente e recusa inexistente", () => {
    const v = resolverValor("selic");
    assert.ok(v, "selic deveria resolver");
    assert.ok(v.conteudo.length > 0);
    assert.equal(typeof v.apurado, "boolean");

    assert.equal(resolverValor("nao-existe"), null);
  });

  it("a variação sai com sinal e sem duplicar o menos", () => {
    const v = resolverValor("ipca", "var");
    assert.ok(v, "ipca deveria resolver");
    // O sinal é aposto na frente; o valor vai em módulo. Sem isso
    // uma queda vira "−-0,20%".
    assert.ok(
      !v.conteudo.includes("--") && !v.conteudo.includes("−-"),
      `sinal duplicado: ${v.conteudo}`,
    );
  });
});

describe("idade da edição", () => {
  it("conta dia de calendário, não múltiplo de 24 horas", () => {
    // Uma edição das 6h de ontem tem "1 dia" às 8h de hoje, ainda que
    // não tenham passado 24 horas. É assim que jornal conta dia.
    const hoje8h = new Date(2026, 7, 20, 8, 0);

    assert.equal(idadeEmDias("2026-08-20", hoje8h), 0);
    assert.equal(idadeEmDias("2026-08-19", hoje8h), 1);
    assert.equal(idadeEmDias("2026-08-18", hoje8h), 2);
  });

  it("edição do futuro não devolve dia negativo", () => {
    assert.equal(idadeEmDias("2026-08-25", new Date(2026, 7, 20, 8, 0)), 0);
  });

  it("atravessa a virada do mês", () => {
    assert.equal(idadeEmDias("2026-07-31", new Date(2026, 7, 2, 10, 0)), 2);
  });
});
