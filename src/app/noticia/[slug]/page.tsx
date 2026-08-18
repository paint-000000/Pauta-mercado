import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Texto from "@/components/glossario/Texto";
import {
  Assinatura,
  Estado,
  formatar,
  RotuloSecao,
  Variacao,
} from "@/components/ui/Dados";
import { getNoticia, noticias, ROTULO_CATEGORIA } from "@/data/noticias";
import { getAtivo } from "@/data/ativos";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return noticias.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNoticia(slug);
  return n ? { title: n.titulo, description: n.resumo } : {};
}

const ROTULO_CENARIO = {
  positivo: "Cenário positivo",
  neutro: "Cenário neutro",
  negativo: "Cenário negativo",
} as const;

const ESTADO_CENARIO = {
  positivo: "favoravel",
  neutro: "neutro",
  negativo: "cautela",
} as const;

/**
 * Notícia + análise.
 *
 * A estrutura é a tese do produto: primeiro o que foi apurado, com
 * tipografia editorial sobre papel; depois, visualmente separada, a
 * leitura da IA sobre aquilo. Quem só quer o fato para de ler no meio
 * e não perde nada; quem quer o significado continua.
 *
 * Os três cenários existem para impedir que a análise vire previsão.
 * Uma leitura que só descreve o caso favorável é torcida, não análise.
 */
export default async function PaginaNoticia({ params }: Props) {
  const { slug } = await params;
  const n = getNoticia(slug);
  if (!n) notFound();

  const relacionados = n.analise.relacionados
    .map(getAtivo)
    .filter((a) => a !== undefined);

  const outras = noticias.filter((o) => o.slug !== n.slug).slice(0, 3);

  return (
    <div className="env">
      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        {/* ---------- Texto apurado ---------- */}
        <article className="col-8">
          <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
            <strong>{ROTULO_CATEGORIA[n.categoria]}</strong>
            <span>·</span>
            <span>{n.chapeu}</span>
          </p>

          <h1 className="manchete manchete-lg">{n.titulo}</h1>

          <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
            {n.resumo}
          </p>

          <div style={{ margin: "var(--e-4) 0 var(--e-6)" }}>
            <Assinatura fontes={n.fontes} natureza="apurado" comHora />
          </div>

          {n.imagem && (
            <div className="figura" style={{ marginBottom: "var(--e-6)" }}>
              <div className="figura-fundo" style={{ background: n.imagem.cor }} />
              <span className="figura-legenda">{n.imagem.legenda}</span>
            </div>
          )}

          <div className="corpo">
            {n.corpo.map((p, i) => (
              <p key={i}>
                <Texto>{p}</Texto>
              </p>
            ))}
          </div>

          {/* ---------- A camada de IA ---------- */}
          <section className="ia" style={{ marginTop: "var(--e-8)" }}>
            <p className="ia-rotulo">O que a IA diz</p>

            <dl>
              <div className="ia-campo">
                <dt>Resumo</dt>
                <dd><Texto>{n.analise.resumo}</Texto></dd>
              </div>

              <div className="ia-campo">
                <dt>Impacto</dt>
                <dd><Texto>{n.analise.impacto}</Texto></dd>
              </div>

              <div className="ia-campo">
                <dt>Cenários</dt>
                <dd>
                  <div className="pilha-2" style={{ marginTop: "var(--e-2)" }}>
                    {n.analise.cenarios.map((c) => (
                      <div
                        key={c.tipo}
                        style={{
                          display: "flex",
                          gap: "var(--e-3)",
                          alignItems: "flex-start",
                        }}
                      >
                        <span style={{ flexShrink: 0, minWidth: 108 }}>
                          <Estado estado={ESTADO_CENARIO[c.tipo]} />
                          <span className="sr">{ROTULO_CENARIO[c.tipo]}</span>
                        </span>
                        <span style={{ fontSize: "var(--t-sm)", lineHeight: 1.5 }}>
                          {c.texto}
                        </span>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>

              <div className="ia-campo">
                <dt>O que acompanhar</dt>
                <dd>
                  <ul className="lista-marcada" style={{ marginTop: "var(--e-2)" }}>
                    {n.analise.acompanhar.map((a, i) => (
                      <li key={i} style={{ fontSize: "var(--t-sm)" }}>{a}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            <div className="ia-nota">
              <span>
                Análise gerada a partir de dados de mercado e fontes públicas.
              </span>
              <span>
                {new Date(n.analise.geradoEm).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>Fontes: {n.fontes.map((f) => f.nome).join(", ")}</span>
            </div>
          </section>
        </article>

        {/* ---------- Coluna lateral ---------- */}
        <aside className="col-4">
          {relacionados.length > 0 && (
            <section style={{ marginBottom: "var(--e-8)" }}>
              <RotuloSecao>Investimentos relacionados</RotuloSecao>
              <ul className="lista-div">
                {relacionados.map((a) => (
                  <li key={a.ticker}>
                    <Link href={`/ativo/${a.ticker}`} className="entre">
                      <span>
                        <span
                          style={{
                            display: "block",
                            fontWeight: 600,
                            fontSize: "var(--t-base)",
                          }}
                        >
                          {a.nome}
                        </span>
                        {a.radar && (
                          <span style={{ display: "inline-block", marginTop: 4 }}>
                            <Estado estado={a.radar.estado} />
                          </span>
                        )}
                      </span>
                      <span style={{ textAlign: "right", flexShrink: 0 }}>
                        <span
                          className="num"
                          style={{ display: "block", fontSize: "var(--t-sm)" }}
                        >
                          {formatar(a.preco, a.casas, a.prefixo)}
                        </span>
                        <Variacao direcao={a.direcao} pct={a.variacaoPct} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <RotuloSecao href="/noticias">Mais notícias</RotuloSecao>
            <ul className="lista-div">
              {outras.map((o) => (
                <li key={o.slug}>
                  <Link href={`/noticia/${o.slug}`}>
                    <p className="chapeu" style={{ marginBottom: 4 }}>
                      {ROTULO_CATEGORIA[o.categoria]}
                    </p>
                    <h3 className="manchete manchete-sm">{o.titulo}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
