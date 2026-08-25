/**
 * ATUALIZAÇÃO DIÁRIA
 *
 * Roda no CI, uma vez por dia, antes do build. Busca as fontes,
 * escreve `src/data/gerado/mercado.json` e sai. O site continua
 * export estático — nenhum leitor faz chamada de rede; quem falou
 * com a internet foi o GitHub Actions, horas antes.
 *
 * A decisão que organiza este arquivo: FALHA NÃO APAGA E NÃO MENTE.
 *
 * Se o Banco Central estiver fora do ar, o valor de ontem continua na
 * tela — mas com a data de ontem, e a interface mostra que está
 * velho. As três saídas possíveis são explícitas no manifesto:
 *
 *   `novo`    a fonte respondeu e o número mudou
 *   `mantido` a fonte respondeu e o número é o mesmo
 *   `velho`   a fonte falhou; vale o último bom, com a data dele
 *
 * Nunca existe uma quarta: número novo sem fonte, ou fonte sem data.
 *
 * Uso:  npm run atualizar
 */

import { writeFileSync } from "node:fs";
import { lerBancoCentral } from "@/lib/fontes/bcb";
import { lerB3 } from "@/lib/fontes/brapi";
import { MERCADO } from "@/data/gerado/mercado";
import type { Manifesto, Registro } from "@/lib/fontes/tipos";

const DESTINO = "src/data/gerado/mercado.ts";

/**
 * A rodada anterior é o próprio módulo gerado, importado como
 * qualquer outro. Isso é o que permite manter o último valor bom sem
 * um segundo arquivo de estado ao lado.
 */
function lerAnterior(): Manifesto {
  return MERCADO;
}

const CABECALHO = `/* GERADO POR scripts/atualizar.ts — NÃO EDITE À MÃO.

   Este arquivo é o retrato do mercado na última rodada do robô. Ele
   é versionado de propósito: o histórico do git vira o histórico do
   que o site mostrou, e dá para responder "o que estava na tela no
   dia X" sem guardar banco nenhum. */
import type { Manifesto } from "@/lib/fontes/tipos";

export const MERCADO: Manifesto = `;

async function principal() {
  const anterior = lerAnterior();
  const dados: Record<string, Registro> = {};
  const fontes: Manifesto["fontes"] = [];

  const adaptadores = [
    { nome: "Banco Central", ler: lerBancoCentral },
    { nome: "B3 (brapi)", ler: lerB3 },
  ];

  for (const { nome, ler } of adaptadores) {
    const r = await ler();

    if (!r.ok) {
      fontes.push({ nome, ok: false, erro: r.erro });
      console.log(`  FALHA ${nome}: ${r.erro}`);
      continue;
    }

    fontes.push({ nome, ok: true });

    for (const leitura of r.leituras) {
      const antes = anterior.dados[leitura.id];
      const mudou = !antes || antes.valor !== leitura.valor;
      dados[leitura.id] = { ...leitura, estado: mudou ? "novo" : "mantido" };
    }

    console.log(`  ok   ${nome} · ${r.leituras.length} leitura(s)`);
  }

  // O que a fonte não trouxe nesta rodada continua valendo, marcado
  // como velho. É a diferença entre "não consegui atualizar" e "não
  // tem dado" — e só a primeira é verdade.
  let herdados = 0;
  for (const [id, antes] of Object.entries(anterior.dados)) {
    if (dados[id]) continue;
    dados[id] = { ...antes, estado: "velho" };
    herdados++;
  }

  if (herdados > 0) {
    console.log(`  ${herdados} valor(es) mantidos da rodada anterior, marcados como velhos`);
  }

  const manifesto: Manifesto = {
    rodadoEm: new Date().toISOString(),
    fontes,
    dados,
  };

  writeFileSync(DESTINO, CABECALHO + JSON.stringify(manifesto, null, 2) + ";\n");

  const vivos = fontes.filter((f) => f.ok).length;
  console.log(`\n${Object.keys(dados).length} série(s) em ${DESTINO}`);
  console.log(`${vivos} de ${fontes.length} fonte(s) responderam.`);

  // Toda fonte fora do ar é falha de build? Não. O site continua
  // correto com dado de ontem, e derrubar o deploy por causa de uma
  // API instável trocaria "dado de ontem" por "site fora do ar".
  // Falha de verdade é não ter dado nenhum.
  if (Object.keys(dados).length === 0) {
    console.error("Nenhum dado disponível — nem novo, nem anterior.");
    process.exit(1);
  }
}

principal().catch((e) => {
  console.error(e);
  process.exit(1);
});
