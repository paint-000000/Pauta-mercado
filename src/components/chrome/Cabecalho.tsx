"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Busca from "./Busca";

/**
 * Masthead + navegação.
 *
 * O briefing lista dez seções no item 4 e pede navegação
 * "extremamente simples" no item 17. Resolvi como jornal resolve:
 * uma linha principal curta com os destinos de leitura, e uma faixa
 * secundária com os cadernos. Duas hierarquias, nenhuma gaveta.
 */

/* Linha principal: destinos de leitura mais as duas ferramentas.
   Calendário e IPOs desceram para a faixa de cadernos — continuam a
   um clique, mas não competem com o que se usa todo dia. */
const PRINCIPAL = [
  { href: "/", rotulo: "Hoje" },
  { href: "/mercados", rotulo: "Mercados" },
  { href: "/noticias", rotulo: "Notícias" },
  { href: "/dicas", rotulo: "Dicas" },
  { href: "/simulador", rotulo: "Simulador", ia: true },
  { href: "/radar", rotulo: "Radar IA", ia: true },
];

const SECOES = [
  { href: "/secao/acoes", rotulo: "Ações" },
  { href: "/secao/fiis", rotulo: "FIIs" },
  { href: "/secao/renda-fixa", rotulo: "Renda fixa" },
  { href: "/secao/etfs", rotulo: "ETFs" },
  { href: "/secao/exterior", rotulo: "Exterior" },
  { href: "/secao/economia", rotulo: "Economia" },
  { href: "/ipos", rotulo: "IPOs" },
  { href: "/calendario", rotulo: "Calendário" },
  { href: "/meu-radar", rotulo: "Meu radar" },
  { href: "/glossario", rotulo: "Glossário" },
];

function ehAtiva(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Cabecalho() {
  const pathname = usePathname();
  const [buscaAberta, setBuscaAberta] = useState(false);

  const data = new Date("2026-08-18T12:00:00-03:00").toLocaleDateString(
    "pt-BR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      <header className="masthead">
        <div className="env">
          <div className="masthead-linha">
            <Link href="/" className="logo">
              <span className="logo-marca">Pauta</span>
              <span className="logo-selo">Mercado</span>
            </Link>

            <span className="masthead-data so-desktop">{data}</span>

            <div className="masthead-acoes">
              <button
                type="button"
                className="botao-icone"
                onClick={() => setBuscaAberta(true)}
                aria-label="Pesquisar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="nav-principal so-desktop" aria-label="Navegação principal">
            {PRINCIPAL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link"
                data-ia={l.ia ? "1" : undefined}
                aria-current={ehAtiva(pathname, l.href) ? "page" : undefined}
              >
                {l.rotulo}
              </Link>
            ))}
          </nav>

          <nav className="nav-secoes" aria-label="Cadernos">
            {SECOES.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.rotulo}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {buscaAberta && <Busca aoFechar={() => setBuscaAberta(false)} />}
    </>
  );
}

/** Navegação inferior do mobile. Cinco destinos, como pede o item 17. */
export function NavMobile() {
  const pathname = usePathname();

  const I = ({ d }: { d: string }) => (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );

  const itens = [
    { href: "/", rotulo: "Hoje", icone: <I d="M4 5h16M4 10h10M4 15h16M4 20h7" /> },
    { href: "/radar", rotulo: "Radar", icone: <I d="M12 21a9 9 0 1 0-9-9M12 12l6-4" /> },
    { href: "/simulador", rotulo: "Simular", icone: <I d="M6 4h12v16H6zM9 8h6M9 12h2M13 12h2M9 16h2M13 16h2" /> },
    { href: "/dicas", rotulo: "Dicas", icone: <I d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z" /> },
    { href: "/noticias", rotulo: "Notícias", icone: <I d="M4 4h13v16H4zM17 9h3v9a2 2 0 0 1-2 2h-1zM7 8h7M7 12h7M7 16h4" /> },
  ];

  return (
    <nav className="nav-mobile so-mobile" aria-label="Navegação">
      {itens.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={ehAtiva(pathname, i.href) ? "page" : undefined}
        >
          {i.icone}
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
