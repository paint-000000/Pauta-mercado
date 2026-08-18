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
import { indicadores, NO_HERO } from "@/data/indicadores";
import { manchete, ROTULO_CATEGORIA, secundarias } from "@/data/noticias";
import { edicao, radar, ROTULO_HORIZONTE, ROTULO_RISCO } from "@/data/radar";
import { ipos, separarIpos } from "@/data/ipos";
import { getAtivo } from "@/data/ativos";
import { dicasDestaque } from "@/data/dicas";

/**
 * A capa.
 *
 * Ordem editorial deliberada, respondendo à pergunta do item 27 de
 * cima para baixo: o que aconteceu (manchete) → como está o mercado
 * (hero de indicadores) → onde prestar atenção (radar) → o resto.
 *
 * O "Bom dia, mercado" fica logo abaixo da manchete porque é a leitura
 * de quem tem 60 segundos; quem tem mais continua descendo.
 */
export default function Hoje() {
  const hero = NO_HERO.map((id) => indicadores.find((i) => i.id === id)).filter(
    (i) => i !== undefined,
  );

  const destaquesRadar = radar.slice(0, 3);
  const { confirmados, naoConfirmados } = separarIpos(ipos);
  const proximoIpo = confirmados[0] ?? naoConfirmados[0];

  return (
    <div className="env">
      {/* ---------- Manchete ---------- */}
      <section className="secao" style={{ marginTop: "var(--e-8)" }}>
        <div className="grade">
          <article className="col-8">
            <Link href={`/noticia/${manchete.slug}`} className="artigo" style={{ borderBottom: 0 }}>
              <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
                <strong>{ROTULO_CATEGORIA[manchete.categoria]}</strong>
                <span>·</span>
                <span>{manchete.chapeu}</span>
              </p>
              <h1 className="manchete manchete-xl">{manchete.titulo}</h1>
              <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
                {manchete.resumo}
              </p>
            </Link>

            {/* A camada de IA, visualmente separada do que foi apurado */}
            <div className="ia" style={{ marginTop: "var(--e-5)" }}>
              <p className="ia-rotulo">O que isso significa</p>
              <p style={{ fontSize: "var(--t-md)", lineHeight: 1.5 }}>
                <Texto>{manchete.analise.resumo}</Texto>
              </p>
              <div className="ia-nota">
                <span>Análise gerada a partir de dados de mercado e fontes públicas.</span>
                <Link href={`/noticia/${manchete.slug}`} style={{ textDecoration: "underline" }}>
                  Ver análise completa
                </Link>
              </div>
            </div>
          </article>

          {/* Bom dia, mercado */}
          <aside className="col-4">
            <div
              style={{
                border: "1px solid var(--c-regra-forte)",
                padding: "var(--e-5)",
                height: "100%",
              }}
            >
              <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
                {new Date(`${edicao.data}T12:00:00`).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}
              </p>
              <h2 className="manchete manchete-md">{edicao.saudacao}</h2>
              <p
                className="linha-fina"
                style={{ fontSize: "var(--t-base)", margin: "var(--e-3) 0 var(--e-4)" }}
              >
                {edicao.chamada}
              </p>

              <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
                Mercado em 60 segundos
              </p>
              <ol className="pilha-2">
                {edicao.sessenta.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: "var(--e-3)",
                      fontSize: "var(--t-sm)",
                      lineHeight: 1.45,
                    }}
                  >
                    <span
                      className="num"
                      style={{
                        color: "var(--c-texto-3)",
                        fontSize: "var(--t-xs)",
                        paddingTop: 2,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span><Texto>{item}</Texto></span>
                  </li>
                ))}
              </ol>

              <div
                style={{
                  borderTop: "1px solid var(--c-regra-media)",
                  marginTop: "var(--e-4)",
                  paddingTop: "var(--e-3)",
                }}
              >
                <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
                  <span className="estado" data-e="risco">Risco do dia</span>
                </p>
                <p style={{ fontSize: "var(--t-sm)", lineHeight: 1.45 }}>
                  <Texto>{edicao.riscoDoDia}</Texto>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- O mercado hoje ---------- */}
      <section className="secao">
        <RotuloSecao href="/mercados">O mercado hoje</RotuloSecao>
        <div className="mercado-grade">
          {hero.map((i) => (
            <Link key={i.id} href={`/mercados#${i.id}`} className="mercado-cel">
              <span className="mercado-nome">{i.nome}</span>
              <span className="mercado-valor">
                {formatar(i.valor, i.casas, i.prefixo, i.sufixo)}
              </span>
              <div className="mercado-rodape">
                <Variacao direcao={i.direcao} pct={i.variacaoPct} />
                <Sparkline serie={i.serie} direcao={i.direcao} largura={60} altura={20} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Radar de hoje ---------- */}
      <section className="secao">
        <RotuloSecao href="/radar" acao="Ver radar completo">
          Radar de hoje
        </RotuloSecao>

        <p
          className="linha-fina"
          style={{ marginBottom: "var(--e-5)", fontSize: "var(--t-base)" }}
        >
          O que a leitura dos dados de hoje coloca sob observação — com a tese,
          o horizonte e o que faria cada uma deixar de valer.
        </p>

        <div className="grade">
          {destaquesRadar.map((r) => {
            const ativo = r.ticker ? getAtivo(r.ticker) : undefined;
            return (
              <article key={r.id} className="col-4">
                <div
                  style={{
                    border: "1px solid var(--c-regra)",
                    borderTop: "3px solid var(--c-regra-forte)",
                    padding: "var(--e-4)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--e-3)",
                  }}
                >
                  <div className="entre">
                    <Estado estado={r.estado} />
                    {/* Sempre pelo componente: `toFixed` usa ponto decimal e
                        quebraria a vírgula pt-BR do resto da página. */}
                    {ativo && (
                      <Variacao direcao={ativo.direcao} pct={ativo.variacaoPct} />
                    )}
                  </div>

                  <h3 className="manchete manchete-sm">{r.titulo}</h3>

                  <p style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-2)" }}>
                    <Texto>{r.motivo}</Texto>
                  </p>

                  <dl
                    style={{
                      display: "flex",
                      gap: "var(--e-4)",
                      fontFamily: "var(--fonte-num)",
                      fontSize: "var(--t-2xs)",
                      textTransform: "uppercase",
                      letterSpacing: "var(--rotulo-tracking)",
                      color: "var(--c-texto-3)",
                      marginTop: "auto",
                      paddingTop: "var(--e-3)",
                      borderTop: "1px solid var(--c-regra)",
                    }}
                  >
                    <div>
                      <dt>Horizonte</dt>
                      <dd style={{ margin: 0, color: "var(--c-texto)" }}>
                        {ROTULO_HORIZONTE[r.horizonte]}
                      </dd>
                    </div>
                    <div>
                      <dt>Risco</dt>
                      <dd style={{ margin: 0, color: "var(--c-texto)" }}>
                        {ROTULO_RISCO[r.risco].replace("Risco ", "")}
                      </dd>
                    </div>
                  </dl>

                  {r.ticker && (
                    <Link
                      href={`/ativo/${r.ticker}`}
                      className="btn"
                      data-v="linha"
                      style={{ minHeight: 38 }}
                    >
                      Entender
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- Simulador + dicas ---------- */}
      <section className="secao">
        <div className="grade">
          <div className="col-7">
            <div className="ia" style={{ height: "100%" }}>
              <p className="ia-rotulo">Simulador</p>
              <h2 className="manchete manchete-md" style={{ maxWidth: "16ch" }}>
                No que investir com R$ 2.000 hoje
              </h2>
              <p
                style={{
                  fontSize: "var(--t-md)",
                  lineHeight: 1.55,
                  marginTop: "var(--e-3)",
                  maxWidth: "48ch",
                  color: "var(--ia-tinta-2)",
                }}
              >
                Três perguntas e uma distribuição sugerida, com a razão de cada
                fatia e o que faria a leitura mudar. Sem cadastro.
              </p>
              <p style={{ marginTop: "var(--e-5)" }}>
                <Link href="/simulador" className="btn" data-v="claro">
                  Simular agora
                </Link>
              </p>
              <div className="ia-nota">
                <span>Simulação educacional · não é recomendação de investimento.</span>
              </div>
            </div>
          </div>

          <div className="col-5">
            <RotuloSecao href="/dicas">Dicas</RotuloSecao>
            <div className="pilha-2">
              {dicasDestaque.slice(0, 4).map((d) => (
                <Link key={d.id} href="/dicas" className="cartao">
                  <h3 className="manchete manchete-sm">{d.titulo}</h3>
                  <p
                    style={{
                      fontSize: "var(--t-sm)",
                      color: "var(--c-texto-2)",
                      marginTop: "var(--e-2)",
                    }}
                  >
                    {d.texto}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Notícias ---------- */}
      <section className="secao">
        <RotuloSecao href="/noticias">Principais notícias</RotuloSecao>
        <div className="rio">
          {secundarias.map((n) => (
            <Link key={n.slug} href={`/noticia/${n.slug}`} className="artigo">
              {n.imagem && (
                <div className="figura">
                  <div
                    className="figura-fundo"
                    style={{ background: n.imagem.cor }}
                  />
                  <span className="figura-legenda">{n.imagem.legenda}</span>
                </div>
              )}
              <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
                <strong>{ROTULO_CATEGORIA[n.categoria]}</strong>
              </p>
              <h3 className="manchete manchete-sm">{n.titulo}</h3>
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
                  {new Date(n.publicadoEm).toLocaleTimeString("pt-BR", {
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

      {/* ---------- IPO Radar + Calendário ---------- */}
      <section className="secao">
        <div className="grade">
          <div className="col-7">
            <RotuloSecao href="/ipos">IPO Radar</RotuloSecao>
            {proximoIpo && (
              <Link href={`/ipo/${proximoIpo.slug}`} className="artigo">
                <div className="entre" style={{ marginBottom: "var(--e-3)" }}>
                  <p className="chapeu">
                    <strong>{proximoIpo.setor}</strong>
                  </p>
                  <span
                    className="estado"
                    data-e={confirmados.includes(proximoIpo) ? "favoravel" : "observar"}
                  >
                    {confirmados.includes(proximoIpo) ? "Confirmado" : "Não confirmado"}
                  </span>
                </div>
                <h3 className="manchete manchete-md">{proximoIpo.empresa}</h3>
                <p
                  style={{
                    fontSize: "var(--t-base)",
                    color: "var(--c-texto-2)",
                    marginTop: "var(--e-2)",
                  }}
                >
                  {proximoIpo.oQueE}
                </p>
              </Link>
            )}
            <p style={{ marginTop: "var(--e-4)" }}>
              <Link href="/ipos" className="btn" data-v="texto">
                Ver todos os IPOs no radar →
              </Link>
            </p>
          </div>

          <div className="col-5">
            <RotuloSecao href="/calendario">Próximos eventos</RotuloSecao>
            <ul className="lista-div">
              {[
                { data: "24 ago", titulo: "Boletim Focus" },
                { data: "26 ago", titulo: "Ata do Copom" },
                { data: "02 set", titulo: "PIB do 2º trimestre" },
                { data: "04 set", titulo: "Payroll — Estados Unidos" },
                { data: "10 set", titulo: "IPCA de agosto" },
              ].map((e) => (
                <li key={e.titulo} className="entre">
                  <span style={{ fontSize: "var(--t-base)" }}>{e.titulo}</span>
                  <span
                    className="num"
                    style={{ color: "var(--c-texto-3)", fontSize: "var(--t-xs)" }}
                  >
                    {e.data}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="secao">
        <Assinatura
          fontes={manchete.fontes}
          natureza="exemplo"
          comHora
        />
      </div>
    </div>
  );
}
