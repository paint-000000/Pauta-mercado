/**
 * Gerador determinístico de série para os sparklines do protótipo.
 *
 * Determinístico de propósito: a mesma semente devolve sempre a mesma
 * série, então servidor e cliente renderizam o mesmo caminho de SVG e
 * não há divergência de hidratação. `Math.random()` aqui produziria um
 * gráfico diferente a cada render e um erro no console.
 *
 * Isto existe só enquanto o app roda com dados de protótipo. Quando a
 * série real chegar da API, este arquivo sai.
 */

/** PRNG xorshift de 32 bits. Barato e estável entre plataformas. */
function prng(semente: number) {
  let x = semente || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    // >>> 0 mantém o valor sem sinal antes de normalizar.
    return ((x >>> 0) % 10000) / 10000;
  };
}

function semear(txt: string): number {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) {
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Caminho aleatório com deriva, terminando exatamente em `fim`.
 *
 * Terminar no valor atual importa: o último ponto do sparkline precisa
 * bater com o número grande ao lado, senão o gráfico contradiz a
 * cotação na mesma linha.
 */
export function gerarSerie(
  chave: string,
  fim: number,
  variacaoPct: number,
  pontos = 32,
): number[] {
  const r = prng(semear(chave));
  const inicio = fim / (1 + variacaoPct / 100);
  const amplitude = Math.abs(fim - inicio) || Math.abs(fim) * 0.012;

  const bruto: number[] = [];
  let atual = inicio;

  for (let i = 0; i < pontos; i++) {
    const progresso = i / (pontos - 1);
    const alvo = inicio + (fim - inicio) * progresso;
    const ruido = (r() - 0.5) * amplitude * 1.4;
    // Puxa para o alvo para o caminho não descolar da tendência.
    atual = atual + (alvo - atual) * 0.55 + ruido;
    bruto.push(atual);
  }

  bruto[0] = inicio;
  bruto[pontos - 1] = fim;
  return bruto;
}

/** Converte uma série em um caminho SVG normalizado numa caixa 0..1. */
export function caminho(
  serie: number[],
  largura: number,
  altura: number,
): string {
  if (serie.length < 2) return "";
  const min = Math.min(...serie);
  const max = Math.max(...serie);
  const faixa = max - min || 1;

  return serie
    .map((v, i) => {
      const x = (i / (serie.length - 1)) * largura;
      // SVG cresce para baixo; inverter deixa alta para cima.
      const y = altura - ((v - min) / faixa) * altura;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
