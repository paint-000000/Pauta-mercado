import type { Metadata } from "next";
import Link from "next/link";
import { RotuloSecao } from "@/components/ui/Dados";
import { noticias, ROTULO_CATEGORIA } from "@/data/noticias";

export const metadata: Metadata = {
  title: "Notícias",
  description: "O que aconteceu no mercado, com a leitura da IA em cada matéria.",
};

export default function Noticias() {
  const ordenadas = [...noticias].sort(
    (a, b) => +new Date(b.publicadoEm) - +new Date(a.publicadoEm),
  );

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Notícias</strong>
        </p>
        <h1 className="manchete manchete-lg">O que aconteceu</h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Toda matéria traz o texto apurado e, separada dele, a leitura do que
          aquilo significa para quem investe.
        </p>
      </header>

      <section className="secao">
        <RotuloSecao>Mais recentes</RotuloSecao>
        <div className="rio">
          {ordenadas.map((n) => (
            <Link key={n.slug} href={`/noticia/${n.slug}`} className="artigo">
              {n.imagem && (
                <div className="figura">
                  <div className="figura-fundo" style={{ background: n.imagem.cor }} />
                  <span className="figura-legenda">{n.imagem.legenda}</span>
                </div>
              )}
              <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
                <strong>{ROTULO_CATEGORIA[n.categoria]}</strong>
                <span>·</span>
                <span>{n.chapeu}</span>
              </p>
              <h2 className="manchete manchete-sm">{n.titulo}</h2>
              <p
                style={{
                  fontSize: "var(--t-sm)",
                  color: "var(--c-texto-2)",
                  marginTop: "var(--e-2)",
                }}
              >
                {n.resumo}
              </p>
              <p className="artigo-meta">
                <span>
                  {new Date(n.publicadoEm).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{n.fontes[0].nome}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
