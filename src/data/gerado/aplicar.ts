/**
 * ONDE O DADO REAL ENCOSTA NO PROTÓTIPO
 *
 * O robô diário escreve `mercado.json`. Este arquivo é o único ponto
 * em que aquilo entra no conteúdo — e é de propósito que seja um só:
 * enquanto a junção estiver aqui, dá para responder "de onde veio
 * este número na tela?" lendo uma função.
 *
 * A regra da sobreposição, em uma frase: DADO REAL SUBSTITUI NÚMERO,
 * NUNCA TEXTO.
 *
 * Valor, variação, série e fonte vêm do Banco Central. Explicação,
 * nome e contexto continuam sendo redação humana. Não é purismo: um
 * número tem procedência verificável, uma frase não — e o produto
 * inteiro se apoia em não confundir as duas coisas.
 *
 * Quando não há dado real para um id, o valor de protótipo continua
 * valendo com `natureza: "exemplo"`, que é o que faz a tarja de
 * "dados fictícios" aparecer só onde ela é verdade.
 */

import type { Indicador, Natureza } from "@/types";
import type { Registro } from "@/lib/fontes/tipos";
import { MERCADO } from "@/data/gerado/mercado";

const DADOS = MERCADO.dados;

/** Quando o robô rodou pela última vez. */
export const RODADO_EM = MERCADO.rodadoEm;

/** Fontes que responderam ou falharam na última rodada. */
export const STATUS_FONTES = MERCADO.fontes;

/** Existe dado real para este id? */
export function temDadoReal(id: string): boolean {
  return id in DADOS;
}

/**
 * Sobrepõe o dado apurado sobre o indicador de protótipo.
 *
 * `direcao` é recalculada em vez de herdada: o protótipo trazia
 * "alta" digitado, e um número novo com a seta velha é pior que
 * nenhum dos dois.
 */
export function aplicarReal(
  base: Indicador,
  dados: Record<string, Registro> = DADOS,
): Indicador {
  const real = dados[base.id];
  if (!real) return base;

  /**
   * Juro e inflação variam em PONTOS, não em porcentagem.
   *
   * O IPCA caindo de 4,64% para 4,44% é uma queda de 0,20 ponto. A
   * conta percentual devolve −4,31%, que o leitor lê como "a inflação
   * caiu 4,3%" — número quatro vezes maior que o fato, e na mesma
   * unidade do valor ao lado, o que impede até de desconfiar.
   *
   * O protótipo já carregava essa convenção; com número congelado
   * ninguém reparava. Com atualização diária ela passa a se mexer na
   * tela todo dia, e aí passa a mentir todo dia.
   */
  const emPontos = base.classe === "juro" || base.classe === "inflacao";
  const variacaoPct = emPontos ? (real.variacao ?? 0) : (real.variacaoPct ?? 0);
  const natureza: Natureza = "apurado";

  return {
    ...base,
    valor: real.valor,
    variacao: real.variacao ?? 0,
    variacaoPct,
    direcao: variacaoPct > 0.001 ? "alta" : variacaoPct < -0.001 ? "baixa" : "estavel",
    // Série curta demais desenha um sparkline que mente sobre a
    // tendência; abaixo de três pontos vale mais o traço do protótipo.
    serie: real.serie && real.serie.length >= 3 ? real.serie : base.serie,
    fontes: [real.fonte],
    natureza,
  };
}

/**
 * Há quantos dias o dado foi apurado.
 *
 * A interface precisa disto para dizer "de hoje" ou "de três dias
 * atrás". Indicador mensal como o IPCA é naturalmente velho e não
 * deve alarmar — quem decide o que é velho demais é quem exibe.
 */
export function diasDesdeApuracao(id: string, agora = Date.now()): number | null {
  const real = DADOS[id];
  if (!real) return null;

  const t = new Date(real.apuradoEm).getTime();
  if (!Number.isFinite(t)) return null;

  return Math.floor((agora - t) / 86_400_000);
}

/** A fonte falhou na última rodada e este número ficou para trás. */
export function estaVelho(id: string): boolean {
  return DADOS[id]?.estado === "velho";
}
