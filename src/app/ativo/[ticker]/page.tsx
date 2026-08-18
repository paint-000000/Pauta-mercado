import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Texto from "@/components/glossario/Texto";
import TermoChip from "@/components/glossario/TermoChip";
import {
  Assinatura,
  Estado,
  formatar,
  RotuloSecao,
  Sparkline,
  Variacao,
} from "@/components/ui/Dados";
import { ativos, getAtivo, ROTULO_TIPO } from "@/data/ativos";
import { ROTULO_HORIZONTE, ROTULO_RISCO } from "@/data/radar";
import { noticias } from "@/data/noticias";

type Props = { params: Promise<{ ticker: string }> };

export function generateStaticParams() {
  return ativos.map((a) => ({ ticker: a.ticker }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const a = getAtivo(ticker);
  return a ? { title: `${a.ticker} — ${a.nome}`, description: a.resumo } : {};
}

/**
 * Página de ativo.
 *
 * Serve ação, FII, ETF, título, índice, moeda e cripto com o mesmo
 * molde — o que muda é a lista de indicadores, que vem do dado. Um
 * template por tipo de ativo multiplicaria manutenção sem mudar o que
 * o leitor vê.
 *
 * `invalidaria` fecha a seção de tese de propósito: é o último texto
 * que a pessoa lê antes de decidir qualquer coisa.
 */
export default async function PaginaAtivo({ params }: Props) {
  const { ticker } = await params;
  const a = getAtivo(ticker);
  if (!a) notFound();

  const relacionadas = noticias.filter((n) =>
    n.analise.relacionados.includes(a.ticker),
  );

  return (
    <div className="env">
      {/* ---------- Cabeçalho do ativo ---------- */}
      <header
        className="secao"
        style={{
          marginTop: "var(--e-8)",
          borderBottom: "1px solid var(--c-regra-forte)",
          paddingBottom: "var(--e-5)",
        }}
      >
        <div className="grade">
          <div className="col-7">
            <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
              <strong>{ROTULO_TIPO[a.tipo]}</strong>
              {a.setor && (
                <>
                  <span>·</span>
                  <span>{a.setor}</span>
                </>
              )}
            </p>
            <h1 className="manchete manchete-lg">{a.nome}</h1>
            <p
              className="num"
              style={{
                fontSize: "var(--t-sm)",
                color: "var(--c-texto-3)",
                marginTop: "var(--e-1)",
              }}
            >
              {a.ticker}
            </p>
            {a.radar && (
              <div style={{ marginTop: "var(--e-3)" }}>
                <Estado estado={a.radar.estado} />
              </div>
            )}
          </div>

          <div className="col-5">
            <div className="entre" style={{ alignItems: "flex-end" }}>
              <div>
                <span
                  className="num"
                  style={{
                    fontSize: "var(--t-4xl)",
                    display: "block",
                    letterSpacing: "-0.035em",
                    lineHeight: 1,
                  }}
                >
                  {formatar(a.preco, a.casas, a.prefixo)}
                </span>
                <span style={{ display: "block", marginTop: "var(--e-2)" }}>
                  <Variacao
                    direcao={a.direcao}
                    pct={a.variacaoPct}
                    absoluto={formatar(a.variacao, a.casas, a.prefixo)}
                  />
                </span>
              </div>
              <Sparkline
                serie={a.serie}
                direcao={a.direcao}
                largura={140}
                altura={54}
                preenchido
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        <div className="col-8">
          {/* ---------- Resumo ---------- */}
          <section>
            <RotuloSecao>O que é</RotuloSecao>
            <p className="corpo">
              <Texto>{a.resumo}</Texto>
            </p>
          </section>

          {/* ---------- Tese ---------- */}
          {a.radar && (
            <section className="secao">
              <div className="ia">
                <p className="ia-rotulo">Por que está no radar</p>

                <dl>
                  <div className="ia-campo">
                    <dt>Tese</dt>
                    <dd><Texto>{a.radar.tese}</Texto></dd>
                  </div>

                  <div className="ia-campo">
                    <dt>Pontos positivos</dt>
                    <dd>
                      <ul className="lista-marcada" style={{ marginTop: "var(--e-2)" }}>
                        {a.radar.positivos.map((p, i) => (
                          <li key={i}><Texto>{p}</Texto></li>
                        ))}
                      </ul>
                    </dd>
                  </div>

                  <div className="ia-campo">
                    <dt>Riscos</dt>
                    <dd>
                      <ul className="lista-marcada" style={{ marginTop: "var(--e-2)" }}>
                        {a.radar.riscos.map((r, i) => (
                          <li key={i}><Texto>{r}</Texto></li>
                        ))}
                      </ul>
                    </dd>
                  </div>

                  <div className="ia-campo">
                    <dt>Para qual perfil pode fazer sentido</dt>
                    <dd>{a.radar.perfil}</dd>
                  </div>

                  {/* O campo que separa análise de palpite. */}
                  <div
                    className="ia-campo"
                    style={{
                      borderTop: "1px solid var(--c-regra-media)",
                      paddingTop: "var(--e-4)",
                      marginTop: "var(--e-5)",
                    }}
                  >
                    <dt style={{ color: "var(--baixa-700)" }}>
                      O que invalidaria esta leitura
                    </dt>
                    <dd><Texto>{a.radar.invalidaria}</Texto></dd>
                  </div>
                </dl>

                <div className="ia-nota">
                  <span>
                    Análise gerada a partir de dados de mercado e fontes públicas.
                  </span>
                  <span>Fontes: {a.fontes.map((f) => f.nome).join(", ")}</span>
                </div>
              </div>
            </section>
          )}

          {/* ---------- Notícias relacionadas ---------- */}
          {relacionadas.length > 0 && (
            <section className="secao">
              <RotuloSecao>Notícias que citam este ativo</RotuloSecao>
              <ul className="lista-div">
                {relacionadas.map((n) => (
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

        {/* ---------- Indicadores ---------- */}
        <aside className="col-4">
          <section>
            <RotuloSecao>Indicadores</RotuloSecao>
            <dl className="lista-div">
              {a.indicadores.map((ind) => (
                <div key={ind.rotulo} className="entre">
                  <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                    {ind.termo ? (
                      <TermoChip slug={ind.termo}>{ind.rotulo}</TermoChip>
                    ) : (
                      ind.rotulo
                    )}
                  </dt>
                  <dd
                    className="num"
                    style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}
                  >
                    {ind.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {a.radar && (
            <section className="secao">
              <RotuloSecao>Enquadramento</RotuloSecao>
              <dl className="lista-div">
                <div className="entre">
                  <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                    Horizonte
                  </dt>
                  <dd style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                    {ROTULO_HORIZONTE[a.radar.horizonte]}
                  </dd>
                </div>
                <div className="entre">
                  <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                    Risco
                  </dt>
                  <dd style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                    {ROTULO_RISCO[a.radar.risco].replace("Risco ", "")}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          <div style={{ marginTop: "var(--e-6)" }}>
            <Assinatura fontes={a.fontes} natureza={a.natureza} />
          </div>
        </aside>
      </div>
    </div>
  );
}
