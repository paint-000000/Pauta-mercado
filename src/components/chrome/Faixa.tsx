import Link from "next/link";
import { indicadores, NA_FAIXA } from "@/data/indicadores";
import { formatar, Variacao } from "@/components/ui/Dados";

/**
 * Faixa de cotações do topo.
 *
 * Rola na horizontal em vez de animar sozinha: marquee automático
 * atrapalha leitura, impede clique e viola a recomendação de não
 * mover conteúdo sem controle do usuário (WCAG 2.2.2).
 *
 * Desde que parte dos indicadores passou a vir do Banco Central, a
 * faixa mistura número apurado e número de protótipo na mesma linha.
 * Enquanto tudo era fictício, a tarja do topo dava conta sozinha;
 * agora ela não dá — quem olha o IBOV não relê a tarja.
 *
 * O que é inventado ganha marca própria: régua tracejada sob a sigla
 * e um til antes do valor. Diferem em FORMA, não só em cor, que é a
 * mesma regra dos seis estados do radar — um print em preto e branco
 * ainda separa os dois.
 */
export default function Faixa() {
  const lista = NA_FAIXA.map((id) =>
    indicadores.find((i) => i.id === id),
  ).filter((i) => i !== undefined);

  return (
    <div className="ticker">
      <div className="env">
        <dl className="ticker-fita">
          {lista.map((i) => (
            <Link
              key={i.id}
              href={`/mercados#${i.id}`}
              className="ticker-item"
              data-ficticio={i.natureza === "apurado" ? undefined : "sim"}
            >
              <dt>
                {i.sigla}
                {i.natureza !== "apurado" && (
                  <span className="ticker-fict" aria-hidden="true">
                    ~
                  </span>
                )}
              </dt>
              <dd>
                {formatar(i.valor, i.casas, i.prefixo, i.sufixo)}
                {i.natureza !== "apurado" && (
                  <span className="so-leitor"> (valor fictício de protótipo)</span>
                )}
              </dd>
              <Variacao direcao={i.direcao} pct={i.variacaoPct} />
            </Link>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="env">
        <div className="rodape-grade">
          <div>
            <h3>Seções</h3>
            <ul>
              <li><Link href="/">Hoje</Link></li>
              <li><Link href="/mercados">Mercados</Link></li>
              <li><Link href="/noticias">Notícias</Link></li>
              <li><Link href="/ipos">IPO Radar</Link></li>
              <li><Link href="/calendario">Calendário</Link></li>
            </ul>
          </div>
          <div>
            <h3>Inteligência</h3>
            <ul>
              <li><Link href="/radar">Radar de hoje</Link></li>
              <li><Link href="/meu-radar">Meu radar</Link></li>
              <li><Link href="/glossario">Glossário</Link></li>
              <li><Link href="/como-funciona">Como funciona</Link></li>
            </ul>
          </div>
          <div>
            <h3>Fontes</h3>
            <ul>
              <li>Banco Central</li>
              <li>IBGE</li>
              <li>B3</li>
              <li>CVM</li>
              <li>Tesouro Direto</li>
            </ul>
          </div>
        </div>

        <p style={{ maxWidth: "var(--largura-texto)", fontSize: "var(--t-xs)" }}>
          Conteúdo informativo e educacional. Não é recomendação de
          investimento e não considera a situação financeira de nenhum leitor
          em particular. Todo investimento envolve risco, inclusive de perda.
          Análises são geradas a partir de dados de mercado e fontes públicas —
          confira sempre na fonte oficial antes de decidir.
        </p>
      </div>
    </footer>
  );
}
