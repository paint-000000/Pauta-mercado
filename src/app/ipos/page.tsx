import type { Metadata } from "next";
import Link from "next/link";
import { Assinatura, RotuloSecao } from "@/components/ui/Dados";
import { ipos, ROTULO_STATUS, separarIpos, statusSustentado } from "@/data/ipos";
import type { Ipo } from "@/types";

export const metadata: Metadata = {
  title: "IPO Radar",
  description:
    "Empresas que podem abrir capital, com o que está confirmado separado do que ainda é rumor.",
};

/**
 * IPO Radar.
 *
 * A regra crítica do produto vive aqui: confirmado e rumor NUNCA
 * compartilham a mesma lista. São duas seções, com dois cabeçalhos e
 * dois tratamentos.
 *
 * Uma etiqueta discreta numa lista única seria ignorada por quem lê
 * rápido — que é como esta página vai ser lida — e a pessoa sairia
 * achando que uma empresa vai abrir capital quando ninguém confirmou.
 *
 * `separarIpos` não confia no status escrito à mão: um item marcado
 * como prospecto sem fonte de domínio oficial cai para o grupo de
 * baixo automaticamente.
 */
export default function IpoRadar() {
  const { confirmados, naoConfirmados } = separarIpos(ipos);

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>IPO Radar</strong>
        </p>
        <h1 className="manchete manchete-lg" style={{ maxWidth: "20ch" }}>
          Quem pode estrear na bolsa
        </h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Só entra na lista de confirmados quem tem documento oficial
          publicado. O resto fica separado, porque rumor de oferta
          frequentemente não se concretiza.
        </p>
      </header>

      <Grupo
        titulo="Confirmados"
        aviso="Ofertas com documento oficial divulgado. Datas e faixas de preço ainda podem mudar até a precificação."
        itens={confirmados}
        vazio="Nenhuma oferta com documento oficial neste momento."
        confirmado
      />

      <Grupo
        titulo="Em estudo ou rumor"
        aviso="Nada aqui foi confirmado oficialmente. São movimentos que circulam no mercado. Serve para acompanhar, não para decidir."
        itens={naoConfirmados}
        vazio="Nada em estudo no momento."
      />
    </div>
  );
}

function Grupo({
  titulo,
  aviso,
  itens,
  vazio,
  confirmado = false,
}: {
  titulo: string;
  aviso: string;
  itens: Ipo[];
  vazio: string;
  confirmado?: boolean;
}) {
  return (
    <section className="secao">
      <RotuloSecao>{titulo}</RotuloSecao>

      <p
        className="linha-fina"
        style={{
          fontSize: "var(--t-base)",
          marginBottom: "var(--e-5)",
          borderLeft: `3px solid ${
            confirmado ? "var(--alta-500)" : "var(--atencao-500)"
          }`,
          paddingLeft: "var(--e-4)",
        }}
      >
        {aviso}
      </p>

      {itens.length === 0 ? (
        <p style={{ color: "var(--c-texto-3)", fontSize: "var(--t-sm)" }}>{vazio}</p>
      ) : (
        <div className="pilha">
          {itens.map((ipo) => {
            const sustentado = statusSustentado(ipo);
            return (
              <article
                key={ipo.slug}
                style={{
                  borderTop: "1px solid var(--c-regra)",
                  paddingTop: "var(--e-5)",
                }}
              >
                <div className="grade">
                  <div className="col-7">
                    <div className="linha" style={{ marginBottom: "var(--e-3)" }}>
                      <span
                        className="estado"
                        data-e={sustentado ? "favoravel" : "observar"}
                      >
                        {ROTULO_STATUS[ipo.status]}
                        {!sustentado && " · sem fonte oficial"}
                      </span>
                      <span className="chapeu">{ipo.mercado}</span>
                    </div>

                    <h3 className="manchete manchete-md">
                      <Link href={`/ipo/${ipo.slug}`}>{ipo.empresa}</Link>
                    </h3>
                    <p className="chapeu" style={{ marginTop: "var(--e-2)" }}>
                      {ipo.setor}
                    </p>

                    <p
                      className="linha-fina"
                      style={{ fontSize: "var(--t-base)", marginTop: "var(--e-3)" }}
                    >
                      {ipo.oQueE}
                    </p>

                    <p style={{ marginTop: "var(--e-4)" }}>
                      <Link href={`/ipo/${ipo.slug}`} className="btn" data-v="linha">
                        Ver detalhes
                      </Link>
                    </p>
                  </div>

                  <div className="col-5">
                    <dl className="lista-div">
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
                          <dd
                            className="num"
                            style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}
                          >
                            {ipo.faixaPreco}
                          </dd>
                        </div>
                      )}
                      <div className="entre">
                        <dt style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                          Mercado
                        </dt>
                        <dd style={{ margin: 0, fontSize: "var(--t-sm)", fontWeight: 500 }}>
                          {ipo.mercado}
                        </dd>
                      </div>
                    </dl>

                    <div style={{ marginTop: "var(--e-4)" }}>
                      <Assinatura fontes={ipo.fontes} natureza={ipo.natureza} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
