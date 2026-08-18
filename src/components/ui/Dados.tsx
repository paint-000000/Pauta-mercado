import Link from "next/link";
import type { Direcao, EstadoRadar, Fonte, Natureza } from "@/types";
import { caminho } from "@/lib/serie";
import { ROTULO_ESTADO } from "@/data/radar";

/* ============ Formatação numérica ============ */

export function formatar(
  valor: number,
  casas: number,
  prefixo?: string,
  sufixo?: string,
): string {
  const n = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
  return `${prefixo ?? ""}${n}${sufixo ?? ""}`;
}

/**
 * Variação com três sinais simultâneos: seta, cor e sinal aritmético.
 * Cor sozinha falha para daltônicos e em tela sob sol forte — e este
 * é o dado que a pessoa lê mais rápido em toda a página.
 */
export function Variacao({
  direcao,
  pct,
  absoluto,
}: {
  direcao: Direcao;
  pct: number;
  absoluto?: string;
}) {
  const sinal = pct > 0 ? "+" : "";
  return (
    <span className="dir" data-d={direcao}>
      {absoluto && <span>{absoluto} </span>}
      {sinal}
      {pct.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      %
    </span>
  );
}

/* ============ Sparkline ============ */

/**
 * Gráfico mínimo, em SVG puro.
 *
 * Não uso biblioteca de gráfico aqui de propósito: o briefing pede
 * "gráficos minimalistas" e alerta contra excesso de gráfico. Um
 * caminho SVG de uma linha dá controle exato sobre o traço e não
 * carrega runtime nenhum — biblioteca entraria só se aparecer
 * interação de verdade, como tooltip ou zoom.
 */
export function Sparkline({
  serie,
  direcao,
  largura = 100,
  altura = 28,
  preenchido = false,
}: {
  serie: number[];
  direcao: Direcao;
  largura?: number;
  altura?: number;
  preenchido?: boolean;
}) {
  if (serie.length < 2) return null;

  const cor =
    direcao === "alta"
      ? "var(--c-alta)"
      : direcao === "baixa"
        ? "var(--c-baixa)"
        : "var(--c-texto-3)";

  const d = caminho(serie, largura, altura);
  const area = `${d} L${largura},${altura} L0,${altura} Z`;

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      width={largura}
      height={altura}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {preenchido && <path d={area} fill={cor} opacity="0.08" />}
      <path
        d={d}
        fill="none"
        stroke={cor}
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ============ Estado do radar ============ */

export function Estado({ estado }: { estado: EstadoRadar }) {
  return (
    <span className="estado" data-e={estado}>
      {ROTULO_ESTADO[estado]}
    </span>
  );
}

/* ============ Procedência ============ */

const ROTULO_NATUREZA: Record<Natureza, string | null> = {
  apurado: null,
  analise: "Análise",
  exemplo: "Protótipo",
};

/**
 * Assinatura de fonte. Obrigatória em todo dado de mercado, notícia,
 * oferta e evento — é componente próprio, e não um `<small>` solto,
 * para que a ausência dela numa página seja visível em revisão.
 */
export function Assinatura({
  fontes,
  natureza,
  comHora = false,
}: {
  fontes: Fonte[];
  natureza: Natureza;
  comHora?: boolean;
}) {
  const selo = ROTULO_NATUREZA[natureza];

  return (
    <p className="artigo-meta" style={{ marginTop: 0 }}>
      <span>
        Fonte: {fontes.map((f) => f.nome).join(" · ")}
      </span>
      <span>
        {new Date(fontes[0].publicadoEm).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })}
        {comHora &&
          ` · ${new Date(fontes[0].publicadoEm).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`}
      </span>
      {selo && <span className="estado" data-e="neutro">{selo}</span>}
    </p>
  );
}

/* ============ Rótulo de seção com régua ============ */

export function RotuloSecao({
  children,
  href,
  acao,
}: {
  children: React.ReactNode;
  href?: string;
  acao?: string;
}) {
  return (
    <h2 className="rotulo-secao">
      <span>{children}</span>
      {href && <Link href={href}>{acao ?? "Ver tudo"} →</Link>}
    </h2>
  );
}
