import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * `npm run lint` existia no package.json sem arquivo de configuração —
 * o ESLint 9 só lê o formato flat, então o comando falhava antes de
 * checar uma linha sequer.
 *
 * O conjunto é o padrão do Next mais TypeScript. Nada de regra de
 * estilo: formatação não é o que quebra este projeto.
 */
export default defineConfig([
  globalIgnores([".next/**", "out/**", "node_modules/**"]),
  ...next,
  ...nextTs,
]);
