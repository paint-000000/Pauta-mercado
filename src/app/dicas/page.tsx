import type { Metadata } from "next";
import Link from "next/link";
import { RotuloSecao } from "@/components/ui/Dados";
import {
  dicasPorCategoria,
  ROTULO_CATEGORIA_DICA,
  dicas,
} from "@/data/dicas";

export const metadata: Metadata = {
  title: "Dicas",
  description:
    "Orientações práticas sobre como investir — cada uma com o motivo por trás.",
};

/**
 * Dicas.
 *
 * A terceira camada educacional do site. O glossário define um termo,
 * a análise interpreta um dado, a dica orienta uma prática — e as três
 * não se sobrepõem.
 *
 * Toda dica mostra o "por quê" no rodapé do cartão. Sem ele a dica
 * vira regra decorada, e regra decorada é abandonada no primeiro caso
 * que não se encaixa.
 */
export default function Dicas() {
  const grupos = dicasPorCategoria();

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

      {grupos.map(([cat, itens]) => (
        <section key={cat} className="secao">
          <RotuloSecao>{ROTULO_CATEGORIA_DICA[cat]}</RotuloSecao>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "var(--e-4)",
            }}
          >
            {itens.map((d, i) => (
              <article key={d.id} className="cartao">
                <div className="dica">
                  <span className="dica-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="manchete manchete-sm">{d.titulo}</h3>

                  <p style={{ fontSize: "var(--t-base)", lineHeight: 1.55 }}>
                    {d.texto}
                  </p>

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

      <section className="secao">
        <div className="ia">
          <p className="ia-rotulo">Colocar em prática</p>
          <p style={{ fontSize: "var(--t-md)", lineHeight: 1.55, maxWidth: "58ch" }}>
            A primeira dica desta página é ter reserva antes de qualquer outra
            coisa. O simulador aplica exatamente essa ordem: informe um valor e
            ele mostra o que considerar primeiro, com a razão de cada fatia.
          </p>
          <p style={{ marginTop: "var(--e-5)" }}>
            <Link href="/simulador" className="btn" data-v="claro">
              Abrir o simulador
            </Link>
          </p>
          <div className="ia-nota">
            <span>
              Simulação educacional. Não é recomendação de investimento.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
