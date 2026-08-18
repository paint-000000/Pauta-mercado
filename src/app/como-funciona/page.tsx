import type { Metadata } from "next";
import { Estado, RotuloSecao } from "@/components/ui/Dados";
import { SIGNIFICADO_ESTADO } from "@/data/radar";
import { ESTADOS } from "@/types";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "De onde vêm os dados, o que a IA faz e o que ela não faz.",
};

/**
 * A página que explica o produto sem eufemismo, incluindo o que ele
 * não faz. Quem lê isto e continua usando confia mais.
 */
export default function ComoFunciona() {
  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Transparência</strong>
        </p>
        <h1 className="manchete manchete-lg">Como funciona</h1>
      </header>

      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        <div className="col-8">
          <section>
            <RotuloSecao>Duas camadas, sempre separadas</RotuloSecao>
            <div className="corpo">
              <p>
                Tudo neste site pertence a uma de duas camadas, e elas nunca
                compartilham o mesmo tratamento visual.
              </p>
              <p>
                O que foi <strong>apurado</strong> aparece em tipografia
                editorial, sobre o papel, com a fonte declarada embaixo. São os
                números e os fatos, como vieram de quem os publica.
              </p>
              <p>
                O que foi <strong>interpretado</strong> aparece em blocos com
                fundo tingido e uma régua à esquerda, sempre com a etiqueta de
                análise. É a leitura sobre aqueles dados — e dá para reconhecer
                de relance, sem precisar ler.
              </p>
            </div>
          </section>

          <section className="secao">
            <RotuloSecao>O que a IA faz</RotuloSecao>
            <ul className="lista-marcada">
              <li>Resume o que aconteceu em linguagem simples.</li>
              <li>Explica quem pode ser afetado e por quê.</li>
              <li>Descreve cenários — inclusive os desfavoráveis.</li>
              <li>Aponta o que acompanhar para confirmar ou derrubar a leitura.</li>
              <li>Classifica o que observar numa escala de seis estados.</li>
            </ul>
          </section>

          <section className="secao">
            <RotuloSecao>O que a IA não faz</RotuloSecao>
            <ul className="lista-marcada">
              <li>Não diz para comprar nem para vender nada.</li>
              <li>Não inventa número: os dados vêm sempre de uma fonte declarada.</li>
              <li>Não promete resultado e não afirma que um ativo vai subir.</li>
              <li>Não trata rumor de oferta como se fosse fato confirmado.</li>
              <li>Não conhece sua situação financeira — não há cadastro.</li>
            </ul>
          </section>

          <section className="secao">
            <RotuloSecao>Os seis estados</RotuloSecao>
            <p
              className="linha-fina"
              style={{ fontSize: "var(--t-base)", marginBottom: "var(--e-4)" }}
            >
              A gradação existe justamente para o produto não virar um robô que
              distribui recomendação de compra. Nenhum estado é uma ordem.
            </p>
            <dl className="lista-div">
              {ESTADOS.map((e) => (
                <div key={e} className="entre">
                  <dt style={{ flexShrink: 0 }}>
                    <Estado estado={e} />
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      fontSize: "var(--t-sm)",
                      color: "var(--c-texto-2)",
                      textAlign: "right",
                    }}
                  >
                    {SIGNIFICADO_ESTADO[e]}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="col-4">
          <section>
            <RotuloSecao>Fontes</RotuloSecao>
            <ul className="lista-div">
              {[
                ["Banco Central", "Selic, câmbio, Focus"],
                ["IBGE", "IPCA, PIB"],
                ["B3", "Índices, cotações, ofertas"],
                ["CVM", "Registro de ofertas públicas"],
                ["Tesouro Direto", "Títulos públicos"],
              ].map(([nome, o]) => (
                <li key={nome}>
                  <strong style={{ display: "block" }}>{nome}</strong>
                  <span style={{ fontSize: "var(--t-sm)", color: "var(--c-texto-3)" }}>
                    {o}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="secao">
            <RotuloSecao>Seus dados</RotuloSecao>
            <p style={{ fontSize: "var(--t-base)" }}>
              Não existe cadastro nem login. As preferências de{" "}
              <strong>Meu radar</strong> ficam guardadas apenas no seu
              navegador e não são enviadas a nenhum servidor.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
