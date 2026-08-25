"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ANOS_CONVERGENCIA,
  premissasPublicas,
  type Cenario,
  type Projecao,
} from "@/lib/projecao";

/**
 * GRÁFICO DE FAIXA — SVG escrito à mão, como o resto do projeto.
 *
 * A regra que o README fixa é que biblioteca de gráfico só entra se
 * aparecer interação de verdade. Aqui aparece: o leitor arrasta o
 * dedo e lê o valor de qualquer ano. Ainda assim não entra — o
 * desenho é uma área, duas linhas e uma guia vertical, e um runtime
 * de gráfico custaria mais em peso do que devolveria em código.
 *
 * Três decisões de leitura estão codificadas no desenho:
 *
 *   1. A faixa inteira é UM objeto visual. O cenário otimista não
 *      tem traço próprio mais grosso nem cor mais viva que o
 *      pessimista — os dois são a borda da mesma área. Destacar o de
 *      cima seria fazer propaganda com CSS.
 *
 *   2. A linha do dinheiro depositado é tracejada e atravessa tudo.
 *      A distância dela até a faixa é o rendimento; sem ela, "R$ 180
 *      mil" parece rendimento e é sobretudo depósito.
 *
 *   3. O eixo começa em zero. Cortar a base infla visualmente o
 *      ganho, e é o truque de gráfico mais comum de material de
 *      investimento.
 */

/**
 * O viewBox muda com a largura da tela, e não só a escala.
 *
 * Um viewBox fixo de 720×300 encolhido para 295px de celular vira um
 * gráfico de 123px de altura com rótulos de 6px — legível na régua do
 * navegador e ilegível no ônibus. Estreitar o sistema de coordenadas
 * em vez de encolher o desenho devolve altura e tamanho de texto sem
 * esticar nada: o traço continua proporcional, porque quem mudou foi
 * a caixa, não a transformação.
 */
const LARGO = { L: 720, A: 300, fonte: 11 };
const ESTREITO = { L: 380, A: 330, fonte: 15 };

const BAIXO = 30; /* faixa dos rótulos de ano */
const TOPO = 14; /* respiro para o rótulo mais alto não colar */

/** Verdadeiro em telas estreitas. Começa falso para servidor e
    cliente renderizarem igual; o efeito corrige no mount. */
function useEstreito(): boolean {
  const [estreito, setEstreito] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const ler = () => setEstreito(mq.matches);
    ler();
    mq.addEventListener("change", ler);
    return () => mq.removeEventListener("change", ler);
  }, []);

  return estreito;
}

const CENARIOS: { chave: Cenario; rotulo: string; nota: string }[] = [
  { chave: "pessimista", rotulo: "Cenário ruim", nota: "1 em 10 termina abaixo" },
  { chave: "base", rotulo: "Cenário central", nota: "metade acima, metade abaixo" },
  { chave: "otimista", rotulo: "Cenário bom", nota: "1 em 10 termina acima" },
];

const brl = (n: number) =>
  Math.round(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

/** Percentual em pt-BR: vírgula decimal, não ponto. */
export const pct = (n: number, casas = 1) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

/** Rótulo curto de eixo: 12,4 mil · 1,2 mi. Eixo não cabe milhar cheio. */
function curto(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: n < 10_000 ? 1 : 0 })} mil`;
  return brl(n);
}

/** Passo de grade "redondo": 1, 2 ou 5 vezes uma potência de dez. */
function passoBonito(bruto: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(bruto)));
  const n = bruto / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/** Eixo: precisa caber em poucos pixels. */
function rotuloTempo(ano: number): string {
  if (ano < 1) return `${Math.round(ano * 12)}m`;
  return `${Math.round(ano)}a`;
}

/** Texto corrido: precisa soar como frase. */
function rotuloLongo(ano: number): string {
  if (ano < 1) {
    const m = Math.max(1, Math.round(ano * 12));
    return `${m} ${m === 1 ? "mês" : "meses"}`;
  }
  const a = Math.round(ano);
  return `${a} ${a === 1 ? "ano" : "anos"}`;
}

export function GraficoProjecao({ p }: { p: Projecao }) {
  const id = useId();
  const { L, A, fonte } = useEstreito() ? ESTREITO : LARGO;
  // `null` = ninguém tocou; a leitura mostra o fim do horizonte, que é
  // a pergunta que a pessoa veio fazer.
  const [i, setI] = useState<number | null>(null);

  const g = useMemo(() => {
    const teto = Math.max(...p.pontos.map((x) => x.otimista), 1);
    const passo = passoBonito(teto / 4);
    const max = Math.ceil(teto / passo) * passo;

    const x = (n: number) => (n / (p.pontos.length - 1 || 1)) * L;
    const y = (v: number) => TOPO + (1 - v / max) * (A - BAIXO - TOPO);

    const linha = (sel: (k: (typeof p.pontos)[number]) => number) =>
      p.pontos.map((k, n) => `${n === 0 ? "M" : "L"}${x(n).toFixed(1)},${y(sel(k)).toFixed(1)}`).join(" ");

    const cima = p.pontos.map((k, n) => `${n === 0 ? "M" : "L"}${x(n).toFixed(1)},${y(k.otimista).toFixed(1)}`);
    const baixo = p.pontos
      .map((k, n) => `L${x(n).toFixed(1)},${y(k.pessimista).toFixed(1)}`)
      .reverse();

    const grade: { v: number; y: number }[] = [];
    for (let v = 0; v <= max + 1; v += passo) grade.push({ v, y: y(v) });

    // As marcas do eixo saem de anos redondos, não de "um ponto a
    // cada N". Espaçar por índice produzia eixo com 2a, 3a, 5a, 6a —
    // tecnicamente regular e ilegível, porque ninguém pensa o próprio
    // prazo em múltiplos de dezoito meses.
    const anos = p.pontos[p.pontos.length - 1].ano;
    const alvos =
      anos <= 1
        ? [0.25, 0.5, 0.75, 1].filter((a) => a <= anos + 1e-6)
        : (() => {
            const passo = Math.max(1, Math.round(anos / 6));
            const lista: number[] = [];
            for (let a = passo; a < anos - passo / 2; a += passo) lista.push(a);
            lista.push(anos);
            return lista;
          })();

    // Cada alvo vira o ponto realmente desenhado mais próximo dele,
    // para o rótulo cair em cima da grade e não ao lado.
    const marcas = alvos.map((alvo) => {
      let n = 0;
      for (let j = 1; j < p.pontos.length; j++) {
        if (Math.abs(p.pontos[j].ano - alvo) < Math.abs(p.pontos[n].ano - alvo)) n = j;
      }
      return { k: p.pontos[n], n };
    });

    return {
      max,
      x,
      y,
      grade,
      marcas,
      area: `${cima.join(" ")} ${baixo.join(" ")} Z`,
      base: linha((k) => k.base),
      investido: linha((k) => k.investido),
    };
  }, [p, L, A]);

  const ponto = p.pontos[i ?? p.pontos.length - 1];
  const ativo = i !== null;
  const rendimento = ponto.base - ponto.investido;

  /** Índice do ponto sob o cursor, em coordenadas do viewBox. */
  function mover(ev: React.PointerEvent<SVGSVGElement>) {
    const caixa = ev.currentTarget.getBoundingClientRect();
    const frac = (ev.clientX - caixa.left) / caixa.width;
    const n = Math.round(frac * (p.pontos.length - 1));
    setI(Math.min(p.pontos.length - 1, Math.max(0, n)));
  }

  return (
    <div className="proj">
      {/* Leitura: sempre presente, muda com a guia. Fica ACIMA do
          gráfico porque é o número que a pessoa veio buscar — o
          desenho existe para dar contexto a ele, não o contrário. */}
      <div className="proj-leitura">
        <div>
          <span className="proj-leitura-rotulo">
            {ativo
              ? `Em ${rotuloLongo(ponto.ano)}, no cenário central`
              : `Depois de ${rotuloLongo(p.anos)}, no cenário central`}
          </span>
          <strong className="proj-leitura-valor">R$ {brl(ponto.base)}</strong>
          <span className="proj-leitura-quebra">
            R$ {brl(ponto.investido)} depositado
            <span aria-hidden="true"> + </span>
            <b>R$ {brl(rendimento)} de rendimento</b>
          </span>
        </div>

        <div className="proj-faixa-fim">
          <span className="proj-leitura-rotulo">Faixa provável</span>
          <span className="num">
            R$ {brl(ponto.pessimista)} — R$ {brl(ponto.otimista)}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${L} ${A}`}
        className="proj-svg"
        role="img"
        aria-label={`Projeção de ${rotuloLongo(p.anos)}. No cenário central, R$ ${brl(p.fim.base)}; a faixa provável vai de R$ ${brl(p.fim.pessimista)} a R$ ${brl(p.fim.otimista)}. Depositado no período: R$ ${brl(p.fim.investido)}. Os valores por ano estão na tabela abaixo do gráfico.`}
        onPointerMove={mover}
        onPointerDown={mover}
        onPointerLeave={() => setI(null)}
      >
        <defs>
          <linearGradient id={`${id}-faixa`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ia-acento)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="var(--ia-acento)" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Grade e escala */}
        {g.grade.map(({ v, y }) => (
          <g key={v}>
            <line x1="0" x2={L} y1={y} y2={y} className="proj-grade" />
            {v > 0 && (
              <text x="4" y={y - 5} className="proj-escala" fontSize={fonte}>
                {curto(v)}
              </text>
            )}
          </g>
        ))}

        {/* A faixa inteira, como um objeto só */}
        <path d={g.area} fill={`url(#${id}-faixa)`} />
        <path d={g.area} className="proj-borda" />

        {/* Dinheiro depositado — tracejado, atravessa a faixa */}
        <path d={g.investido} className="proj-investido" />

        {/* Cenário central */}
        <path d={g.base} className="proj-base" />

        {/* Guia de leitura */}
        <g className="proj-guia" data-ativo={ativo ? "sim" : "nao"}>
          <line
            x1={g.x(i ?? p.pontos.length - 1)}
            x2={g.x(i ?? p.pontos.length - 1)}
            y1={TOPO}
            y2={A - BAIXO}
          />
          <circle cx={g.x(i ?? p.pontos.length - 1)} cy={g.y(ponto.otimista)} r="3" />
          <circle
            cx={g.x(i ?? p.pontos.length - 1)}
            cy={g.y(ponto.base)}
            r="4.5"
            className="proj-guia-base"
          />
          <circle cx={g.x(i ?? p.pontos.length - 1)} cy={g.y(ponto.pessimista)} r="3" />
        </g>

        {/* Eixo do tempo */}
        <line x1="0" x2={L} y1={A - BAIXO} y2={A - BAIXO} className="proj-eixo" />
        {g.marcas.map(({ k, n }) => (
          <text
            key={n}
            x={Math.min(L - fonte, Math.max(fonte, g.x(n)))}
            y={A - 10}
            textAnchor={n === p.pontos.length - 1 ? "end" : "middle"}
            className="proj-tempo"
            fontSize={fonte}
          >
            {rotuloTempo(k.ano)}
          </text>
        ))}
      </svg>

      <div className="proj-legenda">
        <span data-marca="faixa">Faixa provável (8 em 10 casos)</span>
        <span data-marca="base">Cenário central</span>
        <span data-marca="investido">Só o que você depositou</span>
      </div>

      {/* Alternativa não visual. Um gráfico sem tabela é um dado que
          existe só para quem enxerga. */}
      <details className="proj-tabela">
        <summary>Ver os números ano a ano</summary>
        <div className="proj-tabela-rolo">
          <table>
            <caption>
              Projeção {p.emValorDeHoje ? "em poder de compra de hoje" : "em valores nominais"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Quando</th>
                <th scope="col">Depositado</th>
                <th scope="col">Cenário ruim</th>
                <th scope="col">Central</th>
                <th scope="col">Cenário bom</th>
              </tr>
            </thead>
            <tbody>
              {p.pontos
                .filter((k) => k.mes > 0 && k.mes % 12 === 0)
                .map((k) => (
                  <tr key={k.mes}>
                    <th scope="row">{rotuloLongo(k.ano)}</th>
                    <td>{brl(k.investido)}</td>
                    <td>{brl(k.pessimista)}</td>
                    <td>{brl(k.base)}</td>
                    <td>{brl(k.otimista)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Os três cenários com a taxa anual equivalente de cada um. */
export function CartoesCenario({ p }: { p: Projecao }) {
  return (
    <dl className="proj-cenarios">
      {CENARIOS.map(({ chave, rotulo, nota }) => (
        <div key={chave} className="proj-cenario" data-c={chave}>
          <dt>{rotulo}</dt>
          <dd className="proj-cenario-valor">R$ {brl(p.fim[chave])}</dd>
          <dd className="proj-cenario-taxa">
            {p.taxas[chave] >= 0 ? "+" : "−"}
            {pct(Math.abs(p.taxas[chave]))}% ao ano
          </dd>
          <dd className="proj-cenario-nota">{nota}</dd>
        </div>
      ))}
    </dl>
  );
}


/**
 * As premissas, abertas na própria tela.
 *
 * O produto exige `fonte` em todo número apurado, e o compilador
 * impede que um número sem procedência chegue à página. Nenhum
 * número desta projeção foi apurado — todos foram calculados. O
 * equivalente honesto da procedência, aqui, é mostrar a conta: de
 * qual juro real cada retorno saiu e quanto de prêmio foi somado.
 *
 * Fica fechado por padrão porque é referência, não leitura. Mas fica
 * na página, e não num README que o leitor nunca abre.
 */
export function TabelaPremissas({ p }: { p: Projecao }) {
  // A tabela é a DESTA projeção, no horizonte dela. Uma tabela fixa
  // ao lado de um número que varia com o prazo seria as duas coisas
  // se contradizendo na mesma tela.
  const linhas = premissasPublicas(p.anos, p.macro);
  const anos = Math.max(1, Math.round(p.anos));

  return (
    <details className="proj-tabela proj-premissas">
      <summary>De onde saem estes números</summary>

      <p className="proj-premissas-macro">
        Inflação de <strong>{pct(p.macro.ipca)}%</strong> ao ano. O juro básico
        real parte de <strong>{pct(p.macro.juroRealCorrente)}%</strong>, que é o
        que a Selic de hoje paga acima da inflação, e converge para{" "}
        <strong>{pct(p.macro.juroRealNeutro)}%</strong> em{" "}
        {ANOS_CONVERGENCIA} anos — juro alto é remédio, não temperatura normal.
        No horizonte de {anos} {anos === 1 ? "ano" : "anos"} a média fica em{" "}
        <strong>{pct(p.juroRealMedio)}%</strong>, e é dela que sai cada linha
        abaixo.
      </p>

      <div className="proj-tabela-rolo">
        <table>
          <thead>
            <tr>
              <th scope="col">Classe</th>
              <th scope="col">Retorno</th>
              <th scope="col">Oscilação</th>
              <th scope="col" className="proj-col-base">
                Como foi calculado
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.classe}>
                <th scope="row">{l.nome}</th>
                <td>{pct(l.retorno)}%</td>
                <td>{pct(l.vol)}%</td>
                <td className="proj-col-base">{l.base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="proj-premissas-aviso">
        Premissas de protótipo, ainda não revisadas por profissional
        habilitado. Não vieram de série histórica real e não são previsão. A
        projeção também ignora imposto e taxa de administração, que mudam o
        resultado o bastante para não serem detalhe.
      </p>
    </details>
  );
}