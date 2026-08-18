import type { Metadata } from "next";
import { RotuloSecao } from "@/components/ui/Dados";
import { termos } from "@/data/glossario";

export const metadata: Metadata = {
  title: "Glossário",
  description: "Os termos técnicos do mercado explicados em uma ou duas frases.",
};

export default function Glossario() {
  const ordenados = [...termos].sort((a, b) =>
    a.termo.localeCompare(b.termo, "pt-BR"),
  );

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Glossário</strong>
        </p>
        <h1 className="manchete manchete-lg">{termos.length} termos, sem rodeio</h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Você também pode tocar em qualquer palavra sublinhada dentro do site —
          a explicação abre sem tirar você da página.
        </p>
      </header>

      <section className="secao">
        <RotuloSecao>Todos os termos</RotuloSecao>
        <div className="pilha">
          {ordenados.map((t) => (
            <article
              key={t.slug}
              id={t.slug}
              style={{
                borderTop: "1px solid var(--c-regra)",
                paddingTop: "var(--e-4)",
                scrollMarginTop: "var(--e-8)",
              }}
            >
              <div className="grade">
                <div className="col-4">
                  <h2 className="manchete manchete-sm">{t.termo}</h2>
                </div>
                <div className="col-8">
                  <p style={{ fontSize: "var(--t-base)", maxWidth: "var(--largura-texto)" }}>
                    {t.definicaoCurta}
                  </p>
                  {t.exemplo && (
                    <p
                      style={{
                        fontSize: "var(--t-sm)",
                        color: "var(--c-texto-2)",
                        borderLeft: "2px solid var(--c-regra-media)",
                        paddingLeft: "var(--e-3)",
                        marginTop: "var(--e-3)",
                        maxWidth: "var(--largura-texto)",
                      }}
                    >
                      {t.exemplo}
                    </p>
                  )}
                  {t.porQueImporta && (
                    <div className="ia" style={{ marginTop: "var(--e-3)", padding: "var(--e-3) var(--e-4)" }}>
                      <p className="ia-rotulo" style={{ marginBottom: "var(--e-1)" }}>
                        Por que isso importa
                      </p>
                      <p style={{ fontSize: "var(--t-sm)" }}>{t.porQueImporta}</p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
