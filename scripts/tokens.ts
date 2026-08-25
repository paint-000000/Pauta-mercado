/**
 * TOKEN DE SUPERFÍCIE ESCURA USADO SOBRE PAPEL
 *
 * `--ia-tinta`, `--ia-tinta-2` e `--ia-acento` são desenhados para a
 * superfície escura da camada de IA. Sobre o papel eles não têm
 * contraste: `--ia-tinta` num texto sobre `--papel-000` dá 1,13:1,
 * que é branco no branco.
 *
 * Isso não é hipótese. Aconteceu: os links "Simulador" e "Radar IA"
 * do menu principal ficaram praticamente invisíveis, e o defeito só
 * foi descoberto porque alguém achou que estavam "meio apagados".
 * Nenhum teste pegava — CSS não passa pelo compilador.
 *
 * ── O que a checagem NÃO faz ──
 *
 * Não acusa uso como FUNDO. `.btn[data-v="claro"]` pinta o acento
 * atrás de tinta escura e mede 9,01:1 — uso legítimo. Marcar isso
 * seria a mesma armadilha da regra de conteúdo que acusava "IPCA
 * mais 6%": alarme falso vira alarme ignorado.
 *
 * Só `color:` importa aqui, porque só ele põe a cor clara na frente.
 *
 * Uso:  npm run tokens
 */

import { readFileSync } from "node:fs";

const ARQUIVO = "src/app/globals.css";

/** Tintas que só existem sobre a superfície escura. */
const SO_NO_ESCURO = ["--ia-tinta", "--ia-tinta-2", "--ia-acento"];

/**
 * Seletores que já estão sobre superfície escura. Um bloco dentro
 * deles pode usar as tintas à vontade — é para lá que elas foram
 * feitas.
 */
const ESCUROS = [".ia", ".proj", ".tarja"];

const css = readFileSync(ARQUIVO, "utf8");
const problemas: { seletor: string; token: string }[] = [];

// Blocos `seletor { corpo }`. Basta para este CSS, que é plano — sem
// aninhamento e sem pré-processador.
for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const seletor = m[1].trim().split("\n").pop()!.trim();
  const corpo = m[2];

  if (ESCUROS.some((e) => seletor.includes(e))) continue;

  for (const linha of corpo.split(";")) {
    const [prop, valor] = linha.split(":");
    if (!prop || !valor) continue;
    // `color` sim; `background-color`, `border-color` e afins não.
    if (prop.trim() !== "color") continue;

    for (const token of SO_NO_ESCURO) {
      if (valor.includes(token)) problemas.push({ seletor, token });
    }
  }
}

if (problemas.length > 0) {
  console.log("  FALHA tinta de superfície escura usada sobre papel");
  for (const p of problemas) {
    console.log(`        ${p.seletor}: color usa ${p.token}`);
  }
  console.error(
    `\n${problemas.length} uso(s) sem contraste. Use --c-texto, --c-texto-2 ou --c-texto-3.`,
  );
  process.exit(1);
}

console.log("  ok   tinta escura só sobre superfície escura");
