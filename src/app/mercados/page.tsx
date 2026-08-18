import type { Metadata } from "next";
import Link from "next/link";
import Texto from "@/components/glossario/Texto";
import {
  Assinatura,
  Estado,
  formatar,
  RotuloSecao,
  Sparkline,
  Variacao,
} from "@/components/ui/Dados";
import { indicadores } from "@/data/indicadores";
import { ativos, ROTULO_TIPO } from "@/data/ativos";

export const metadata: Metadata = {
  title: "Mercados",
  description: "Índices, moedas, juros e inflação, com o que cada número significa.",
};

const GRUPOS = [
  { classe: "indice", titulo: "Índices" },
  { classe: "moeda", titulo: "Moedas" },
  { classe: "cripto", titulo: "Cripto" },
  { classe: "juro", titulo: "Juros" },
  { classe: "inflacao", titulo: "Inflação" },
] as const;

export default function Mercados() {
  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Mercados</strong>
        </p>
        <h1 className="manchete manchete-lg">O mercado hoje</h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Cada número com a explicação do que ele é e do que muda quando ele se
          mexe. Toque em qualquer termo sublinhado para a definição curta.
        </p>
      </header>

      {GRUPOS.map((g) => {
        const lista = indicadores.filter((i) => i.classe === g.classe);
        if (lista.length === 0) return null;

        return (
          <section key={g.classe} className="secao">
            <RotuloSecao>{g.titulo}</RotuloSecao>
            <div className="pilha">
              {lista.map((i) => (
                <article
                  key={i.id}
                  id={i.id}
                  style={{
                    borderTop: "1px solid var(--c-regra)",
                    paddingTop: "var(--e-4)",
                    scrollMarginTop: "var(--e-8)",
                  }}
                >
                  <div className="grade">
                    <div className="col-5">
                      <div className="entre" style={{ alignItems: "flex-end" }}>
                        <div>
                          <span className="mercado-nome">
                            {i.nome} · {i.referencia}
                          </span>
                          <span
                            className="num"
                            style={{
                              fontSize: "var(--t-3xl)",
                              display: "block",
                              letterSpacing: "-0.035em",
                              marginTop: "var(--e-1)",
                            }}
                          >
                            {formatar(i.valor, i.casas, i.prefixo, i.sufixo)}
                          </span>
                          <span style={{ display: "block", marginTop: 4 }}>
                            <Variacao direcao={i.direcao} pct={i.variacaoPct} />
                          </span>
                        </div>
                        <Sparkline
                          serie={i.serie}
                          direcao={i.direcao}
                          largura={110}
                          altura={44}
                          preenchido
                        />
                      </div>
                    </div>

                    <div className="col-7">
                      <p style={{ fontSize: "var(--t-base)", maxWidth: "var(--largura-texto)" }}>
                        <Texto>{i.explicacao}</Texto>
                      </p>
                      <div style={{ marginTop: "var(--e-3)" }}>
                        <Assinatura fontes={i.fontes} natureza={i.natureza} comHora />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {/* Ativos acompanhados */}
      <section className="secao">
        <RotuloSecao>Ativos acompanhados</RotuloSecao>
        <div className="tabela-env">
          <table className="dados">
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Radar</th>
                <th className="n">Preço</th>
                <th className="n">Variação</th>
              </tr>
            </thead>
            <tbody>
              {ativos.map((a) => (
                <tr key={a.ticker}>
                  <td>
                    <Link href={`/ativo/${a.ticker}`}>
                      <strong style={{ display: "block" }}>{a.nome}</strong>
                      <span
                        className="num"
                        style={{ fontSize: "var(--t-xs)", color: "var(--c-texto-3)" }}
                      >
                        {a.ticker}
                      </span>
                    </Link>
                  </td>
                  <td style={{ color: "var(--c-texto-2)" }}>{ROTULO_TIPO[a.tipo]}</td>
                  <td>{a.radar && <Estado estado={a.radar.estado} />}</td>
                  <td className="n">{formatar(a.preco, a.casas, a.prefixo)}</td>
                  <td className="n">
                    <Variacao direcao={a.direcao} pct={a.variacaoPct} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
