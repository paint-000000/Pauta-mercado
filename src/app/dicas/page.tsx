"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RotuloSecao } from "@/components/ui/Dados";
import {
  dicas,
  ORDEM_CATEGORIAS,
  ROTULO_CATEGORIA_DICA,
  type CategoriaDica,
} from "@/data/dicas";
import { CLASSES } from "@/lib/simulador";

/**
 * Dicas.
 *
 * A terceira camada educacional. O glossário define um termo, a
 * análise interpreta um dado, a dica orienta uma prática — e as três
 * não se sobrepõem.
 *
 * Cada dica mostra o "por quê" e, quando existe, um exemplo com
 * número. É o exemplo que transforma "taxa pequena importa" em algo
 * que a pessoa confere na própria cabeça.
 */
export default function Dicas() {
  const [filtro, setFiltro] = useState<CategoriaDica | "todas">("todas");

  const visiveis = useMemo(
    () => (filtro === "todas" ? dicas : dicas.filter((d) => d.categoria === filtro)),
    [filtro],
  );

  const grupos = useMemo(
    () =>
      ORDEM_CATEGORIAS.map(
        (c) => [c, visiveis.filter((d) => d.categoria === c)] as const,
      ).filter(([, itens]) => itens.length > 0),
    [visiveis],
  );

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Dicas</strong>
        </p>
        <h1 className="manchete manchete-lg" style={{ maxWidth: "20ch" }}>
          O que fazer, e por que fazer
        </h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          {dicas.length} orientações práticas. Nenhuma manda comprar nada, e
          todas explicam o motivo — porque regra sem motivo é abandonada no
          primeiro caso que não se encaixa.
        </p>
      </header>

      <div className="secao">
        <div className="filtro" role="group" aria-label="Filtrar por categoria">
          <button
            type="button"
            className="chip"
            aria-pressed={filtro === "todas"}
            onClick={() => setFiltro("todas")}
          >
            Todas
            <span style={{ opacity: 0.6 }}>{dicas.length}</span>
          </button>
          {ORDEM_CATEGORIAS.map((c) => {
            const n = dicas.filter((d) => d.categoria === c).length;
            return (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={filtro === c}
                onClick={() => setFiltro(c)}
              >
                {ROTULO_CATEGORIA_DICA[c]}
                <span style={{ opacity: 0.6 }}>{n}</span>
              </button>
            );
          })}
        </div>

        {grupos.map(([cat, itens]) => (
          <section key={cat} style={{ marginBottom: "var(--e-12)" }}>
            <RotuloSecao>{ROTULO_CATEGORIA_DICA[cat]}</RotuloSecao>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "var(--e-4)",
              }}
            >
              {itens.map((d) => (
                <article key={d.id} className="cartao">
                  <div className="dica">
                    {/* Sem numeração: as dicas são um conjunto, não uma
                        sequência. O ordinal sugeria uma ordem que não
                        existe — e reiniciava em 01 a cada categoria. */}
                    {d.destaque && (
                      <span className="dica-selo">Essencial</span>
                    )}

                    <h3 className="manchete manchete-sm">{d.titulo}</h3>

                    <p style={{ fontSize: "var(--t-base)", lineHeight: 1.55 }}>
                      {d.texto}
                    </p>

                    {d.exemplo && <p className="dica-exemplo">{d.exemplo}</p>}

                    {d.aplicaA && d.aplicaA.length > 0 && (
                      <p className="dica-aplica">
                        <span>Vale para</span>
                        {d.aplicaA.map((c) => (
                          <span
                            key={c}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: "var(--c-texto-2)",
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: 2,
                                background: CLASSES[c].cor,
                                display: "inline-block",
                              }}
                            />
                            {CLASSES[c].nome}
                          </span>
                        ))}
                      </p>
                    )}

                    <p className="dica-porque">
                      <strong>Por quê</strong>
                      {d.porque}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="secao">
        <div className="ia">
          <p className="ia-rotulo">Colocar em prática</p>
          <h2 className="manchete manchete-md" style={{ maxWidth: "18ch" }}>
            O simulador segue esta mesma ordem
          </h2>
          <p
            style={{
              fontSize: "var(--t-md)",
              lineHeight: 1.55,
              marginTop: "var(--e-3)",
              maxWidth: "56ch",
              color: "var(--ia-tinta-2)",
            }}
          >
            Reserva antes de tudo, prazo antes de perfil, e uma razão para cada
            escolha. Informe um valor e ele mostra a distribuição — e, dentro de
            cada classe, quais instrumentos existem de verdade.
          </p>
          <p style={{ marginTop: "var(--e-5)" }}>
            <Link href="/simulador" className="btn" data-v="claro">
              Abrir o simulador
            </Link>
          </p>
          <div className="ia-nota">
            <span>Simulação educacional · não é recomendação de investimento.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
