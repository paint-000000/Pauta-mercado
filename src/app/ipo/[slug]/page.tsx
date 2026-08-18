import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Texto from "@/components/glossario/Texto";
import { Assinatura, RotuloSecao } from "@/components/ui/Dados";
import { getIpo, ipos, ROTULO_STATUS, statusSustentado } from "@/data/ipos";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ipos.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = getIpo(slug);
  return i ? { title: `${i.empresa} — IPO`, description: i.oQueE } : {};
}

/**
 * Detalhe do IPO.
 *
 * Data prevista e faixa de preço só aparecem quando existem. Um campo
 * "a definir" convida o leitor a preencher a lacuna com o que ouviu
 * falar — melhor não ter a linha do que ter a linha vazia.
 */
export default async function PaginaIpo({ params }: Props) {
  const { slug } = await params;
  const ipo = getIpo(slug);
  if (!ipo) notFound();

  const sustentado = statusSustentado(ipo);

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <div className="linha" style={{ marginBottom: "var(--e-3)" }}>
          <span className="estado" data-e={sustentado ? "favoravel" : "observar"}>
            {ROTULO_STATUS[ipo.status]}
          </span>
          <span className="chapeu">{ipo.setor}</span>
          <span className="chapeu">{ipo.mercado}</span>
        </div>

        <h1 className="manchete manchete-lg">{ipo.empresa}</h1>
      </header>

      {!sustentado && (
        <div
          className="secao"
          style={{
            borderLeft: "3px solid var(--atencao-500)",
            background: "var(--atencao-100)",
            padding: "var(--e-4) var(--e-5)",
          }}
        >
          <p className="chapeu" style={{ color: "var(--atencao-700)", marginBottom: "var(--e-2)" }}>
            Ainda não confirmado
          </p>
          <p style={{ fontSize: "var(--t-base)", maxWidth: "var(--largura-texto)" }}>
            Não existe documento oficial sobre esta oferta. Tudo abaixo é
            informação que circula no mercado e pode não se concretizar.
          </p>
        </div>
      )}

      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        <div className="col-8">
          <section>
            <RotuloSecao>O que é a empresa</RotuloSecao>
            <p className="corpo"><Texto>{ipo.oQueE}</Texto></p>
          </section>

          <section className="secao">
            <RotuloSecao>Por que importa</RotuloSecao>
            <p className="corpo"><Texto>{ipo.porQueImporta}</Texto></p>
          </section>

          <section className="secao">
            <RotuloSecao>Principais riscos</RotuloSecao>
            <ul className="lista-marcada">
              {ipo.riscos.map((r, i) => (
                <li key={i}><Texto>{r}</Texto></li>
              ))}
            </ul>
          </section>

          <section className="secao">
            <div className="ia">
              <p className="ia-rotulo">O que observar</p>
              <ul className="lista-marcada">
                {ipo.oQueObservar.map((o, i) => (
                  <li key={i}><Texto>{o}</Texto></li>
                ))}
              </ul>
              <div className="ia-nota">
                <span>
                  Análise gerada a partir de fontes públicas. Nenhuma informação
                  sobre a oferta é produzida por este site.
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside className="col-4">
          <RotuloSecao>Dados da oferta</RotuloSecao>
          <dl className="lista-div">
            <div className="entre">
              <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>Status</dt>
              <dd style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                {ROTULO_STATUS[ipo.status]}
              </dd>
            </div>
            {ipo.dataPrevista && (
              <div className="entre">
                <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                  Data prevista
                </dt>
                <dd style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                  {ipo.dataPrevista}
                </dd>
              </div>
            )}
            {ipo.faixaPreco && (
              <div className="entre">
                <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                  Faixa de preço
                </dt>
                <dd className="num" style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                  {ipo.faixaPreco}
                </dd>
              </div>
            )}
            <div className="entre">
              <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>Segmento</dt>
              <dd style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                {ipo.mercado}
              </dd>
            </div>
          </dl>

          <div style={{ marginTop: "var(--e-6)" }}>
            <Assinatura fontes={ipo.fontes} natureza={ipo.natureza} />
          </div>
        </aside>
      </div>
    </div>
  );
}
