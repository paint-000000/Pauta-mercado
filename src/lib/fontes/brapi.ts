/**
 * BRAPI — COTAÇÕES DA B3
 *
 * ⚠️  ESTE ADAPTADOR TRAZ EMPRESAS REAIS PARA DENTRO DO PRODUTO, E
 *     ISSO MUDA O QUE O PRODUTO PODE DIZER.
 *
 * O README explica por que as empresas do protótipo são inventadas:
 * escrever uma tese de "cautela por alavancagem" sobre uma companhia
 * real, com números que não foram apurados, produziria exatamente o
 * artefato que o produto existe para não produzir — e um print dessa
 * página não teria como se defender.
 *
 * Cotação real não resolve esse problema; ela o agrava. Com PETR4 na
 * tela, qualquer texto ao lado passa a ser lido como análise sobre a
 * Petrobras. Por isso a regra que este arquivo estabelece e que a
 * validação de conteúdo faz cumprir:
 *
 *     TICKER REAL RECEBE PREÇO. NUNCA RECEBE TESE.
 *
 * O que entra é `natureza: "apurado"` — número, fonte, horário. A
 * camada de interpretação continua restrita a classes de ativo e a
 * macroeconomia, onde afirmar algo não é falar de uma empresa
 * específica com dado que ninguém apurou.
 *
 * ── Chave ──
 * O plano gratuito exige token para índice e para consulta de vários
 * papéis de uma vez. Sem `BRAPI_TOKEN` o adaptador não quebra o
 * build: devolve erro, e o site segue com o último dado bom.
 */

import type { Fonte } from "@/types";
import { buscar, numero, type Leitura, type ResultadoFonte } from "@/lib/fontes/tipos";

const RAIZ = "https://brapi.dev/api/quote";

/**
 * Papéis acompanhados. Lista curta de propósito: cada ticker aqui é
 * uma empresa real que aparece na tela, e a lista deve caber na
 * revisão de quem responde pelo conteúdo.
 */
export const TICKERS = ["PETR4", "VALE3", "ITUB4", "BBAS3", "B3SA3", "WEGE3"];

/** O índice usa o mesmo endpoint, com acento de circunflexo. */
const INDICE = "^BVSP";

type Cotacao = {
  symbol?: unknown;
  longName?: unknown;
  shortName?: unknown;
  regularMarketPrice?: unknown;
  regularMarketChange?: unknown;
  regularMarketChangePercent?: unknown;
  regularMarketTime?: unknown;
};

function fonteB3(publicadoEm: string): Fonte {
  return {
    nome: "B3, via brapi.dev",
    url: "https://brapi.dev",
    publicadoEm,
  };
}

/**
 * Converte uma cotação, ou devolve `null` se faltar o essencial.
 *
 * Preço ausente não vira zero. Um zero atravessaria a validação de
 * tipo, chegaria à tela como "R$ 0,00" e pareceria cotação — que é
 * pior do que não mostrar nada.
 */
function converter(c: Cotacao): Leitura | null {
  const symbol = typeof c.symbol === "string" ? c.symbol : null;
  const preco = numero(c.regularMarketPrice);
  if (!symbol || preco === null) return null;

  const apuradoEm =
    typeof c.regularMarketTime === "string"
      ? c.regularMarketTime
      : new Date().toISOString();

  return {
    id: symbol,
    valor: preco,
    variacao: numero(c.regularMarketChange) ?? 0,
    variacaoPct: numero(c.regularMarketChangePercent) ?? 0,
    apuradoEm,
    fonte: fonteB3(apuradoEm),
  };
}

export async function lerB3(token = process.env.BRAPI_TOKEN): Promise<ResultadoFonte> {
  if (!token) {
    return {
      ok: false,
      erro:
        "BRAPI_TOKEN ausente — cotações de ações e do Ibovespa não foram atualizadas. " +
        "Registre-se grátis em brapi.dev e adicione o token nos secrets do repositório.",
    };
  }

  try {
    const alvos = [INDICE, ...TICKERS].map(encodeURIComponent).join(",");
    const bruto = await buscar(`${RAIZ}/${alvos}?token=${encodeURIComponent(token)}`);

    const resultados =
      typeof bruto === "object" && bruto !== null && Array.isArray((bruto as { results?: unknown }).results)
        ? ((bruto as { results: Cotacao[] }).results)
        : null;

    if (!resultados || resultados.length === 0) {
      return { ok: false, erro: "brapi respondeu sem cotações" };
    }

    const leituras = resultados
      .map(converter)
      .filter((l): l is Leitura => l !== null);

    if (leituras.length === 0) {
      return { ok: false, erro: "nenhuma cotação utilizável na resposta" };
    }

    return { ok: true, leituras };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}
