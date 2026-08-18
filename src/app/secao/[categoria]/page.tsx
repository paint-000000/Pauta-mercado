import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Estado, formatar, RotuloSecao, Variacao } from "@/components/ui/Dados";
import { noticias, ROTULO_CATEGORIA } from "@/data/noticias";
import { ativos, ROTULO_TIPO } from "@/data/ativos";
import type { Categoria, TipoAtivo } from "@/types";

type Props = { params: Promise<{ categoria: string }> };

/** Cada caderno junta as notícias da categoria e os ativos do tipo. */
const CADERNOS: Record<
  string,
  { titulo: string; categoria: Categoria; tipos: TipoAtivo[] }
> = {
  acoes: { titulo: "Ações", categoria: "acoes", tipos: ["acao"] },
  fiis: { titulo: "FIIs", categoria: "fiis", tipos: ["fii"] },
  "renda-fixa": { titulo: "Renda fixa", categoria: "renda-fixa", tipos: ["titulo"] },
  etfs: { titulo: "ETFs", categoria: "etfs", tipos: ["etf"] },
  exterior: { titulo: "Exterior", categoria: "exterior", tipos: ["etf", "cripto"] },
  economia: { titulo: "Economia", categoria: "economia", tipos: [] },
};

export function generateStaticParams() {
  return Object.keys(CADERNOS).map((categoria) => ({ categoria }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const c = CADERNOS[categoria];
  return c ? { title: c.titulo } : {};
}

export default async function Caderno({ params }: Props) {
  const { categoria } = await params;
  const caderno = CADERNOS[categoria];
  if (!caderno) notFound();

  const materias = noticias.filter((n) => n.categoria === caderno.categoria);
  const relacionados = ativos.filter((a) => caderno.tipos.includes(a.tipo));

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Caderno</strong>
        </p>
        <h1 className="manchete manchete-lg">{caderno.titulo}</h1>
      </header>

      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        <div className="col-8">
          <RotuloSecao>Notícias</RotuloSecao>
          {materias.length === 0 ? (
            <p style={{ color: "var(--c-texto-3)", fontSize: "var(--t-sm)" }}>
              Nenhuma matéria neste caderno hoje.
            </p>
          ) : (
            <div className="pilha">
              {materias.map((n) => (
                <Link key={n.slug} href={`/noticia/${n.slug}`} className="artigo">
                  <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
                    <strong>{ROTULO_CATEGORIA[n.categoria]}</strong>
                    <span>·</span>
                    <span>{n.chapeu}</span>
                  </p>
                  <h2 className="manchete manchete-md">{n.titulo}</h2>
                  <p
                    className="linha-fina"
                    style={{ fontSize: "var(--t-base)", marginTop: "var(--e-2)" }}
                  >
                    {n.resumo}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="col-4">
          <RotuloSecao>Ativos do caderno</RotuloSecao>
          {relacionados.length === 0 ? (
            <p style={{ color: "var(--c-texto-3)", fontSize: "var(--t-sm)" }}>
              Este caderno não acompanha ativos específicos.
            </p>
          ) : (
            <ul className="lista-div">
              {relacionados.map((a) => (
                <li key={a.ticker}>
                  <Link href={`/ativo/${a.ticker}`} className="entre">
                    <span>
                      <span style={{ display: "block", fontWeight: 600, fontSize: "var(--t-base)" }}>
                        {a.nome}
                      </span>
                      <span className="chapeu">{ROTULO_TIPO[a.tipo]}</span>
                      {a.radar && (
                        <span style={{ display: "inline-block", marginTop: 4 }}>
                          <Estado estado={a.radar.estado} />
                        </span>
                      )}
                    </span>
                    <span style={{ textAlign: "right", flexShrink: 0 }}>
                      <span className="num" style={{ display: "block", fontSize: "var(--t-sm)" }}>
                        {formatar(a.preco, a.casas, a.prefixo)}
                      </span>
                      <Variacao direcao={a.direcao} pct={a.variacaoPct} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
