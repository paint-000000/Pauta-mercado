import { validarTudo } from "@/lib/validacao";

/**
 * Roda a validação de conteúdo e falha o build se algo estiver órfão.
 *
 * Imprime todas as regras, inclusive as que passaram: em revisão, ver
 * que a regra rodou vale tanto quanto ver que ela não achou nada.
 */
const resultados = validarTudo();
let problemas = 0;

for (const { nome, problemas: lista } of resultados) {
  if (lista.length === 0) {
    console.log(`  ok   ${nome}`);
    continue;
  }

  problemas += lista.length;
  console.log(`  FALHA ${nome}`);
  for (const p of lista) {
    console.log(`        ${p.onde}: ${p.o_que}`);
  }
}

console.log("");

if (problemas > 0) {
  console.error(
    `${problemas} problema(s) de conteúdo. O build não sai com conteúdo órfão.`,
  );
  process.exit(1);
}

console.log("Conteúdo validado.");
