import type { NextConfig } from "next";

/**
 * O site é publicado como export estático no GitHub Pages.
 *
 * `output: "export"` é o que produz o diretório `out/` que o workflow
 * de deploy envia. Sem ele o build gera `.next`, o passo de upload não
 * acha `./out` e o deploy falha sem dizer por quê.
 *
 * `trailingSlash` não é preferência de estilo: o Pages resolve
 * diretório, não extensão. Com ele, `/simulador/` encontra
 * `simulador/index.html`; sem ele, toda rota interna dá 404.
 *
 * O basePath NÃO é declarado aqui, de propósito. O passo
 * `actions/configure-pages` do workflow injeta o basePath correto
 * (`/Pauta-mercado`) durante o build — declarar aqui também
 * atrapalharia essa injeção e quebraria os caminhos dos assets.
 *
 * Se um dia o site subir num host com runtime (Vercel, por exemplo),
 * basta remover `output` e `unoptimized`.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  // Pages serve arquivo e nada mais: sem servidor Node, o otimizador
  // de imagem do Next (`/_next/image`) não existe.
  images: { unoptimized: true },

  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
