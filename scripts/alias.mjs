import { registerHooks } from "node:module";
import { statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Resolve o alias `@/…` do tsconfig quando os módulos rodam no Node
 * puro — validação de conteúdo e testes.
 *
 * O Node 22.6+ executa TypeScript removendo os tipos, então não é
 * preciso compilar nada para rodar `simulador.ts` ou `validacao.ts`
 * fora do Next. O que ele não faz é ler `paths` do tsconfig nem
 * adivinhar a extensão do arquivo. São as duas coisas que este gancho
 * resolve, e só elas: nenhuma transformação de código acontece aqui.
 *
 * Usado como `node --import ./scripts/alias.mjs <arquivo>`.
 */

const raiz = new URL("../src/", import.meta.url);

function ehArquivo(caminho) {
  try {
    return statSync(caminho).isFile();
  } catch {
    return false;
  }
}

function comExtensao(url) {
  const base = fileURLToPath(url);
  if (ehArquivo(base)) return url;

  // `@/types` é um diretório com index.ts — daí as duas últimas
  // tentativas. Sem elas o Node tenta ler a pasta como arquivo.
  for (const sufixo of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    if (ehArquivo(base + sufixo)) return pathToFileURL(base + sufixo);
  }

  return url;
}

registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador.startsWith("@/")) {
      const alvo = comExtensao(new URL(especificador.slice(2), raiz));
      return { url: alvo.href, shortCircuit: true };
    }
    return proximo(especificador, contexto);
  },
});
