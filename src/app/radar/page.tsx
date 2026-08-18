import type { Metadata } from "next";
import Link from "next/link";
import Texto from "@/components/glossario/Texto";
import { Estado, RotuloSecao } from "@/components/ui/Dados";
import {
  radar,
  ROTULO_ESTADO,
  ROTULO_HORIZONTE,
  ROTULO_RISCO,
  SIGNIFICADO_ESTADO,
} from "@/data/radar";
import { ESTADOS } from "@/types";

export const metadata: Metadata = {
  title: "Radar de hoje",
  description:
    "A leitura dos dados de hoje, classificada de oportunidade a risco — com a tese e o que a invalidaria.",
};

/**
 * Radar completo.
 *
 * A legenda dos seis estados vem antes das entradas de propósito: sem
 * ela, "favorável" e "observar" viram sinônimos na cabeça de quem lê,
 * e a gradação — que é o produto inteiro — se perde.
 *
 * Nenhuma entrada existe sem `invalidaria`. É a diferença entre
 * análise e recomendação de compra com formatação bonita.
 */
export default function Radar() {
  const porEstado = ESTADOS.map((e) => ({
    estado: e,
    itens: radar.filter((r) => r.estado === e),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Radar IA</strong>
          <span>·</span>
          <span>18 de agosto</span>
        </p>
        <h1 className="manchete manchete-lg" style={{ maxWidth: "18ch" }}>
          Onde vale prestar atenção hoje
        </h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Cada entrada traz a tese, o horizonte, o risco e — o mais
          importante — o que faria a leitura deixar de valer. Nada aqui é
          recomendação de compra.
        </p>
      </header>

      {/* ---------- Legenda ---------- */}
      <section className="secao">
        <RotuloSecao>Como ler os estados</RotuloSecao>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--e-4)",
          }}
        >
          {ESTADOS.map((e) => (
            <div key={e} className="pilha-2">
              <Estado estado={e} />
              <p style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                {SIGNIFICADO_ESTADO[e]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Entradas ---------- */}
      {porEstado.map(({ estado, itens }) => (
        <section key={estado} className="secao">
          <RotuloSecao>{ROTULO_ESTADO[estado]}</RotuloSecao>

          <div className="pilha">
            {itens.map((r) => (
              <article
                key={r.id}
                style={{
                  borderTop: "1px solid var(--c-regra)",
                  paddingTop: "var(--e-5)",
                }}
              >
                <div className="grade">
                  <div className="col-7">
                    <div className="linha" style={{ marginBottom: "var(--e-3)" }}>
                      <Estado estado={r.estado} />
                      <span className="chapeu">{ROTULO_HORIZONTE[r.horizonte]}</span>
                      <span className="chapeu">{ROTULO_RISCO[r.risco]}</span>
                    </div>

                    <h3 className="manchete manchete-md">{r.titulo}</h3>

                    <p
                      className="linha-fina"
                      style={{ fontSize: "var(--t-base)", marginTop: "var(--e-3)" }}
                    >
                      <Texto>{r.motivo}</Texto>
                    </p>

                    {r.ticker && (
                      <p style={{ marginTop: "var(--e-4)" }}>
                        <Link href={`/ativo/${r.ticker}`} className="btn" data-v="linha">
                          Entender a tese
                        </Link>
                      </p>
                    )}
                  </div>

                  <div className="col-5">
                    <div className="ia" style={{ height: "100%" }}>
                      <p className="ia-rotulo">Tese</p>
                      <p style={{ fontSize: "var(--t-base)", lineHeight: 1.5 }}>
                        <Texto>{r.tese}</Texto>
                      </p>

                      {/* dt/dd só são válidos dentro de dl — daí o wrapper. */}
                      <dl style={{ marginTop: "var(--e-4)" }}>
                        <div className="ia-campo">
                          <dt style={{ color: "var(--baixa-700)" }}>
                            O que invalidaria
                          </dt>
                          <dd style={{ fontSize: "var(--t-sm)" }}>
                            <Texto>{r.invalidaria}</Texto>
                          </dd>
                        </div>

                        <div className="ia-campo">
                          <dt>Para qual perfil</dt>
                          <dd style={{ fontSize: "var(--t-sm)" }}>{r.perfil}</dd>
                        </div>
                      </dl>

                      <div className="ia-nota">
                        <span>Fontes: {r.fontes.map((f) => f.nome).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
