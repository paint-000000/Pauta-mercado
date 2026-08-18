import type { NextConfig } from "next";

/**
 * O site é publicado como export estático no GitHub Pages.
 *
 * `output: "export"` produz o diretório `out/` que o workflow envia.
 * Localmente ele também é necessário — sem isso `npm run build` gera
 * `.next` e o resultado local não se parece com o que vai ao ar.
 *
 * ── Sobre trailingSlash e basePath: NÃO declare nenhum dos dois ──
 *
 * O passo `actions/configure-pages` do workflow escreve um
 * `next.config.js` próprio durante o build, e o Next resolve `.js`
 * antes de `.ts`. Ou seja: no deploy, quem vale é o config da action,
 * não este arquivo.
 *
 * Isso foi verificado no ar. Com `trailingSlash: true` declarado aqui,
 * o site publicado continuou servindo `/simulador` (200) e devolvendo
 * 404 em `/simulador/` — o comportamento de quem NÃO tem trailingSlash.
 * A action venceu.
 *
 * Declarar as duas opções aqui só criaria divergência entre o build
 * local e o publicado. O basePath (`/Pauta-mercado`) e a estrutura de
 * arquivos ficam por conta da action; este arquivo cuida do resto.
 *
 * Se um dia o site sair do Pages para um host com runtime (Vercel),
 * basta remover `output` e `unoptimized`.
 */
const nextConfig: NextConfig = {
  output: "export",

  // Pages serve arquivo e nada mais: sem servidor Node, o otimizador
  // de imagem do Next (`/_next/image`) não existe.
  images: { unoptimized: true },

  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
