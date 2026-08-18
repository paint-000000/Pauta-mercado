"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Estado, RotuloSecao } from "@/components/ui/Dados";
import Texto from "@/components/glossario/Texto";
import { radar } from "@/data/radar";
import { noticias } from "@/data/noticias";
import { eventos, ipos } from "@/data/ipos";
import type { Interesse } from "@/types";

/**
 * Meu radar — personalização sem cadastro.
 *
 * Tudo vive no `localStorage`. Não há conta, não há servidor e nada
 * sai do navegador. É a única forma de personalizar sem pedir dado
 * pessoal, e o texto da página diz isso em vez de deixar implícito.
 *
 * Hidratação: o primeiro render (servidor e cliente) usa a lista
 * vazia, e o storage entra no efeito. Ler `localStorage` durante o
 * render produziria HTML diferente no servidor e um erro no console.
 */

const CHAVE = "pauta:interesses:v1";

const OPCOES: { valor: Interesse; rotulo: string; descricao: string }[] = [
  { valor: "renda-fixa", rotulo: "Renda fixa", descricao: "Tesouro, CDB, títulos" },
  { valor: "acoes", rotulo: "Ações brasileiras", descricao: "Bolsa doméstica" },
  { valor: "fiis", rotulo: "FIIs", descricao: "Fundos imobiliários" },
  { valor: "exterior", rotulo: "Exterior", descricao: "Mercados de fora" },
  { valor: "cripto", rotulo: "Cripto", descricao: "Criptomoedas" },
  { valor: "ipos", rotulo: "IPOs", descricao: "Ofertas públicas" },
];

/** Que entradas do radar interessam a cada tema. */
const MAPA: Record<Interesse, string[]> = {
  "renda-fixa": ["tesouro-ipca-longo"],
  acoes: ["etf-indice-brasil", "energia-alavancada"],
  fiis: ["fii-tijolo"],
  exterior: ["etf-exterior"],
  cripto: ["cripto"],
  ipos: [],
};

const CATEGORIA_POR_INTERESSE: Record<Interesse, string[]> = {
  "renda-fixa": ["renda-fixa", "economia"],
  acoes: ["acoes", "mercados"],
  fiis: ["fiis"],
  exterior: ["exterior"],
  cripto: ["mercados"],
  ipos: ["ipos"],
};

export default function MeuRadar() {
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) setInteresses(JSON.parse(bruto) as Interesse[]);
    } catch {
      // Storage bloqueado (modo privado, política do navegador).
      // Seguir sem persistência é melhor que quebrar a página.
    }
    setCarregado(true);
  }, []);

  function alternar(v: Interesse) {
    setInteresses((atual) => {
      const novo = atual.includes(v)
        ? atual.filter((x) => x !== v)
        : [...atual, v];
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novo));
      } catch {}
      return novo;
    });
  }

  const semSelecao = interesses.length === 0;

  const idsRadar = new Set(interesses.flatMap((i) => MAPA[i]));
  const meuRadar = semSelecao ? radar : radar.filter((r) => idsRadar.has(r.id));

  const cats = new Set(interesses.flatMap((i) => CATEGORIA_POR_INTERESSE[i]));
  const minhasNoticias = semSelecao
    ? noticias.slice(0, 3)
    : noticias.filter((n) => cats.has(n.categoria));

  const meusIpos = semSelecao || interesses.includes("ipos") ? ipos : [];

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Meu radar</strong>
        </p>
        <h1 className="manchete manchete-lg">O que você acompanha</h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Escolha os temas e o radar passa a mostrar só o que interessa. Sem
          cadastro: as escolhas ficam guardadas neste navegador e não são
          enviadas a lugar nenhum.
        </p>
      </header>

      <section className="secao">
        <RotuloSecao>Temas</RotuloSecao>
        <div className="linha">
          {OPCOES.map((o) => (
            <button
              key={o.valor}
              type="button"
              className="chip"
              aria-pressed={interesses.includes(o.valor)}
              onClick={() => alternar(o.valor)}
            >
              {o.rotulo}
            </button>
          ))}
        </div>

        {carregado && (
          <p
            style={{
              marginTop: "var(--e-3)",
              fontSize: "var(--t-sm)",
              color: "var(--c-texto-3)",
            }}
          >
            {semSelecao
              ? "Nenhum tema escolhido — mostrando tudo."
              : `${interesses.length} ${interesses.length === 1 ? "tema" : "temas"} · filtrando o radar`}
          </p>
        )}
      </section>

      {/* Resumo do dia */}
      <section className="secao">
        <RotuloSecao>Hoje no seu radar</RotuloSecao>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            borderTop: "1px solid var(--c-regra)",
            borderLeft: "1px solid var(--c-regra)",
          }}
        >
          {[
            { n: meuRadar.length, r: "no radar" },
            { n: minhasNoticias.length, r: "notícias" },
            { n: eventos.length, r: "eventos" },
            { n: meusIpos.length, r: "IPOs" },
          ].map((c) => (
            <div key={c.r} className="mercado-cel">
              <span className="mercado-valor" style={{ marginTop: 0 }}>
                {c.n}
              </span>
              <span className="mercado-nome">{c.r}</span>
            </div>
          ))}
        </div>
      </section>

      {meuRadar.length > 0 && (
        <section className="secao">
          <RotuloSecao href="/radar">Entradas do radar</RotuloSecao>
          <div className="pilha">
            {meuRadar.map((r) => (
              <article
                key={r.id}
                style={{ borderTop: "1px solid var(--c-regra)", paddingTop: "var(--e-4)" }}
              >
                <div className="linha" style={{ marginBottom: "var(--e-2)" }}>
                  <Estado estado={r.estado} />
                </div>
                <h3 className="manchete manchete-sm">
                  {r.ticker ? (
                    <Link href={`/ativo/${r.ticker}`}>{r.titulo}</Link>
                  ) : (
                    r.titulo
                  )}
                </h3>
                <p
                  style={{
                    fontSize: "var(--t-sm)",
                    color: "var(--c-texto-2)",
                    marginTop: "var(--e-2)",
                    maxWidth: "var(--largura-texto)",
                  }}
                >
                  <Texto>{r.motivo}</Texto>
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {minhasNoticias.length > 0 && (
        <section className="secao">
          <RotuloSecao href="/noticias">Notícias dos seus temas</RotuloSecao>
          <ul className="lista-div">
            {minhasNoticias.map((n) => (
              <li key={n.slug}>
                <Link href={`/noticia/${n.slug}`}>
                  <p className="chapeu" style={{ marginBottom: 4 }}>{n.chapeu}</p>
                  <h3 className="manchete manchete-sm">{n.titulo}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
