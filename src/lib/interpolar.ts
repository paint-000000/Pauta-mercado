/**
 * VALOR VIVO DENTRO DA PROSA
 *
 * O jornal escreveu "o Copom manteve a Selic em 10,50%". A frase era
 * verdadeira quando foi redigida e virou mentira quando o site passou
 * a puxar a Selic do Banco Central: a faixa do topo dizia 14,00% e o
 * texto, três centímetros abaixo, dizia 10,50%.
 *
 * Nenhuma revisão de texto resolve isso de forma durável. Enquanto o
 * número morar dentro da string, ele envelhece sozinho, em silêncio,
 * e só é descoberto quando alguém repara — que foi exatamente o que
 * aconteceu aqui.
 *
 * A marcação `{{selic}}` resolve a classe inteira: o número sai do
 * texto e passa a ser buscado na hora de renderizar. Segue a mesma
 * escolha do glossário — marcação explícita no conteúdo, não
 * detecção automática — porque quem escreve decide onde o valor vivo
 * ajuda, e porque marcação órfã é detectável: a validação falha o
 * build em vez de publicar `{{selik}}` na cara do leitor.
 *
 *   {{selic}}        valor atual formatado          14,00%
 *   {{ibovespa.var}} variação, com sinal            +0,80%
 *
 * O que a marcação NÃO faz: consertar afirmação. Interpolar a Selic
 * numa frase que diz "o Copom cortou" não torna o corte verdadeiro.
 * Ela mantém números coerentes; a veracidade da frase continua sendo
 * responsabilidade de quem a escreve.
 */

import { getIndicador } from "@/data/indicadores";
import { formatar } from "@/lib/formato";

export const PADRAO_VALOR = /\{\{([a-z0-9-]+)(?:\.(var))?\}\}/gi;

/** Uma marcação já resolvida. */
export type ValorResolvido = {
  /** Já formatado em pt-BR, pronto para a tela. */
  conteudo: string;
  id: string;
  /** Veio de fonte real, ou ainda é número de protótipo. */
  apurado: boolean;
};

/**
 * Resolve uma marcação. Devolve `null` quando o indicador não existe
 * — quem chama decide se isso é erro de build ou texto cru na tela.
 */
export function resolverValor(id: string, campo?: string): ValorResolvido | null {
  const i = getIndicador(id);
  if (!i) return null;

  const apurado = i.natureza === "apurado";

  if (campo === "var") {
    const sinal = i.variacaoPct > 0 ? "+" : i.variacaoPct < 0 ? "−" : "";
    return {
      // A variação de juro e inflação já vem em pontos, não em
      // percentual — ver `aplicarReal`. O sufixo segue "%" porque é
      // como o resto da tela mostra, e trocar aqui criaria duas
      // convenções na mesma página.
      conteudo: `${sinal}${formatar(Math.abs(i.variacaoPct), 2)}%`,
      id,
      apurado,
    };
  }

  return {
    conteudo: formatar(i.valor, i.casas, i.prefixo, i.sufixo),
    id,
    apurado,
  };
}

/** Ids de indicador referenciados num texto. Usado pela validação. */
export function valoresReferenciados(texto: string): string[] {
  const re = new RegExp(PADRAO_VALOR.source, "gi");
  const ids: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(texto)) !== null) ids.push(m[1].toLowerCase());
  return ids;
}
