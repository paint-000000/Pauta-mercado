import type { Metadata } from "next";
import { Assinatura, RotuloSecao } from "@/components/ui/Dados";
import { eventos, ROTULO_TIPO_EVENTO } from "@/data/ipos";
import type { EventoCalendario } from "@/types";

export const metadata: Metadata = {
  title: "Calendário econômico",
  description: "Os eventos que podem mexer com o mercado nos próximos dias.",
};

/** A "hoje" do protótipo. Vira `new Date()` quando os dados forem reais. */
const HOJE = new Date("2026-08-18T12:00:00-03:00");

function diasAte(data: string): number {
  const d = new Date(`${data}T12:00:00-03:00`);
  return Math.round((+d - +HOJE) / 86400000);
}

function agrupar(lista: EventoCalendario[]) {
  const hoje: EventoCalendario[] = [];
  const semana: EventoCalendario[] = [];
  const proximos: EventoCalendario[] = [];

  for (const e of lista) {
    const d = diasAte(e.data);
    if (d <= 0) hoje.push(e);
    else if (d <= 7) semana.push(e);
    else proximos.push(e);
  }
  const ordena = (a: EventoCalendario, b: EventoCalendario) =>
    a.data.localeCompare(b.data);

  return [
    { titulo: "Hoje", itens: hoje.sort(ordena) },
    { titulo: "Esta semana", itens: semana.sort(ordena) },
    { titulo: "Próximos eventos", itens: proximos.sort(ordena) },
  ].filter((g) => g.itens.length > 0);
}

export default function Calendario() {
  const grupos = agrupar(eventos);

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Calendário</strong>
        </p>
        <h1 className="manchete manchete-lg">O que vem pela frente</h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Cada evento traz o que ele é e o que pode mudar quando o número sair —
          porque data no calendário sem consequência é só data.
        </p>
      </header>

      {grupos.map((g) => (
        <section key={g.titulo} className="secao">
          <RotuloSecao>{g.titulo}</RotuloSecao>
          <div className="pilha">
            {g.itens.map((e) => (
              <article
                key={e.id}
                style={{
                  borderTop: "1px solid var(--c-regra)",
                  paddingTop: "var(--e-4)",
                }}
              >
                <div className="grade">
                  <div className="col-3">
                    <p
                      className="num"
                      style={{ fontSize: "var(--t-lg)", letterSpacing: "-0.02em" }}
                    >
                      {new Date(`${e.data}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                    {e.hora && (
                      <p
                        className="num"
                        style={{ fontSize: "var(--t-xs)", color: "var(--c-texto-3)" }}
                      >
                        {e.hora}
                      </p>
                    )}
                  </div>

                  <div className="col-5">
                    <div className="linha" style={{ marginBottom: "var(--e-2)" }}>
                      <span className="chapeu">{ROTULO_TIPO_EVENTO[e.tipo]}</span>
                      <span
                        className="estado"
                        data-e={
                          e.importancia === "alta"
                            ? "cautela"
                            : e.importancia === "media"
                              ? "observar"
                              : "neutro"
                        }
                      >
                        {e.importancia === "alta"
                          ? "Alta relevância"
                          : e.importancia === "media"
                            ? "Média"
                            : "Baixa"}
                      </span>
                    </div>
                    <h3 className="manchete manchete-sm">{e.titulo}</h3>
                    <p
                      style={{
                        fontSize: "var(--t-sm)",
                        color: "var(--c-texto-2)",
                        marginTop: "var(--e-2)",
                      }}
                    >
                      {e.descricao}
                    </p>
                  </div>

                  <div className="col-4">
                    <div className="ia" style={{ padding: "var(--e-4)" }}>
                      <p className="ia-rotulo" style={{ marginBottom: "var(--e-2)" }}>
                        Por que importa
                      </p>
                      <p style={{ fontSize: "var(--t-sm)", lineHeight: 1.5 }}>
                        {e.porQueImporta}
                      </p>
                    </div>
                    <div style={{ marginTop: "var(--e-3)" }}>
                      <Assinatura fontes={e.fontes} natureza={e.natureza} />
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
