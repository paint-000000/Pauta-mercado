"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ativos, ROTULO_TIPO } from "@/data/ativos";
import { indicadores } from "@/data/indicadores";
import { noticias } from "@/data/noticias";
import { termos } from "@/data/glossario";

type Resultado = {
  tipo: "Ativo" | "Indicador" | "Notícia" | "Termo";
  titulo: string;
  detalhe: string;
  href: string;
};

/**
 * Busca global.
 *
 * Índice montado em memória a partir dos dados de protótipo — quando
 * houver backend, a mesma interface passa a consultar a API e nada
 * muda aqui. Ordem dos grupos é editorial: ativo primeiro, porque é
 * o que a pessoa digita quando digita uma sigla.
 */
export default function Busca({ aoFechar }: { aoFechar: () => void }) {
  const [q, setQ] = useState("");
  const campoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campoRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aoFechar]);

  const indice = useMemo<Resultado[]>(
    () => [
      ...ativos.map((a) => ({
        tipo: "Ativo" as const,
        titulo: `${a.ticker} · ${a.nome}`,
        detalhe: `${ROTULO_TIPO[a.tipo]}${a.setor ? ` · ${a.setor}` : ""}`,
        href: `/ativo/${a.ticker}`,
      })),
      ...indicadores.map((i) => ({
        tipo: "Indicador" as const,
        titulo: i.nome,
        detalhe: i.referencia,
        href: `/mercados#${i.id}`,
      })),
      ...noticias.map((n) => ({
        tipo: "Notícia" as const,
        titulo: n.titulo,
        detalhe: n.chapeu,
        href: `/noticia/${n.slug}`,
      })),
      ...termos.map((t) => ({
        tipo: "Termo" as const,
        titulo: t.termo,
        detalhe: t.definicaoCurta,
        href: `/glossario#${t.slug}`,
      })),
    ],
    [],
  );

  const resultados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (termo.length < 2) return [];
    return indice
      .filter(
        (r) =>
          r.titulo.toLowerCase().includes(termo) ||
          r.detalhe.toLowerCase().includes(termo),
      )
      .slice(0, 12);
  }, [q, indice]);

  return (
    <>
      <button
        className="fundo-overlay"
        onClick={aoFechar}
        aria-label="Fechar busca"
        tabIndex={-1}
      />
      <div className="folha" role="dialog" aria-modal="true" aria-label="Buscar">
        <label className="chapeu" htmlFor="busca" style={{ marginBottom: "var(--e-2)" }}>
          Buscar
        </label>
        <input
          id="busca"
          ref={campoRef}
          className="campo"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ativo, indicador, notícia ou termo"
          autoComplete="off"
        />

        <div style={{ marginTop: "var(--e-4)" }}>
          {q.trim().length < 2 ? (
            <p style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-3)" }}>
              Tente <strong>Tesouro</strong>, <strong>ETFI11</strong>,{" "}
              <strong>Selic</strong> ou <strong>duration</strong>.
            </p>
          ) : resultados.length === 0 ? (
            <p style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-3)" }}>
              Nada encontrado para “{q}”.
            </p>
          ) : (
            <ul className="lista-div">
              {resultados.map((r) => (
                <li key={r.href + r.titulo}>
                  <Link href={r.href} onClick={aoFechar} className="entre">
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontWeight: 600,
                          fontSize: "var(--t-base)",
                        }}
                      >
                        {r.titulo}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "var(--t-xs)",
                          color: "var(--c-texto-3)",
                        }}
                      >
                        {r.detalhe}
                      </span>
                    </span>
                    <span className="chapeu" style={{ flexShrink: 0 }}>
                      {r.tipo}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
