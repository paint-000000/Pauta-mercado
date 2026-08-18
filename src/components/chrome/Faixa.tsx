import Link from "next/link";
import { indicadores, NA_FAIXA } from "@/data/indicadores";
import { formatar, Variacao } from "@/components/ui/Dados";

/**
 * Faixa de cotações do topo.
 *
 * Rola na horizontal em vez de animar sozinha: marquee automático
 * atrapalha leitura, impede clique e viola a recomendação de não
 * mover conteúdo sem controle do usuário (WCAG 2.2.2).
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
            <Link key={i.id} href={`/mercados#${i.id}`} className="ticker-item">
              <dt>{i.sigla}</dt>
              <dd>{formatar(i.valor, i.casas, i.prefixo, i.sufixo)}</dd>
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
