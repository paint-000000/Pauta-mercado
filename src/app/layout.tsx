import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

import GlossarioProvider from "@/components/glossario/GlossarioProvider";
import Cabecalho, { NavMobile } from "@/components/chrome/Cabecalho";
import Faixa, { Rodape } from "@/components/chrome/Faixa";

/**
 * next/font baixa e serve as fontes do próprio domínio no build — é
 * self-hosting automático. Zero DNS para terceiro e zero rastreamento
 * do leitor pelo Google.
 *
 * Newsreader para manchete: desenhada para notícia em tela, com eixo
 * óptico. Plex Sans e Plex Mono para interface e número — o numeral
 * tabular do Plex é excelente, e é ele que segura toda a tabela de
 * cotações do site.
 */
const editorial = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const ui = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pauta Mercado — jornal financeiro inteligente",
    template: "%s — Pauta Mercado",
  },
  description:
    "O que aconteceu no mercado hoje, o que isso significa e onde vale prestar atenção. Sem cadastro.",
  applicationName: "Pauta Mercado",
  // Sem index enquanto roda com dados de protótipo: uma página de
  // número fictício indexada é o artefato que o produto existe para
  // não produzir.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fdfcfa",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${editorial.variable} ${ui.variable} ${mono.variable}`}
    >
      <body>
        <a href="#conteudo" className="pular">
          Pular para o conteúdo
        </a>

        <GlossarioProvider>
          <p className="tarja" role="status">
            Protótipo · cotações e análises são fictícias
          </p>

          <Cabecalho />
          <Faixa />

          <main id="conteudo" className="pagina">
            {children}
          </main>

          <Rodape />
          <NavMobile />
        </GlossarioProvider>
      </body>
    </html>
  );
}
