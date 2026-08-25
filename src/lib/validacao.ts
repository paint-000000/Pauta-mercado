import { ativos } from "@/data/ativos";
import { dicas } from "@/data/dicas";
import { existeTermo, termos } from "@/data/glossario";
import { indicadores, NA_FAIXA, NO_HERO } from "@/data/indicadores";
import { eventos, ipos, separarIpos, statusSustentado } from "@/data/ipos";
import { noticias } from "@/data/noticias";
import { oportunidades } from "@/data/oportunidades";
import { edicao, radar } from "@/data/radar";
import { TICKERS } from "@/lib/fontes/brapi";
import { valoresReferenciados } from "@/lib/interpolar";

/**
 * VALIDAÇÃO DE CONTEÚDO
 *
 * O README promete três coisas que o compilador sozinho não garante:
 * que todo `[[termo]]` abre alguma explicação, que todo dado carrega
 * procedência, e que nenhuma oferta é afirmada como existente sem
 * fonte primária. O tipo obriga o campo a estar lá; não obriga o
 * conteúdo dele a fazer sentido.
 *
 * Isto roda antes do build (`npm run build`) e no CI. Um chip que não
 * abre nada é bug de conteúdo, e bug de conteúdo neste produto é o
 * mesmo que bug de código: publica um número sem defesa.
 *
 * Cada regra devolve mensagens em vez de lançar exceção — quem edita
 * conteúdo quer ver os cinco problemas de uma vez, não um por rodada.
 */

export type Problema = { onde: string; o_que: string };

const MARCACAO = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Percorre qualquer estrutura de dados e visita cada string. */
function cadaTexto(
  valor: unknown,
  caminho: string,
  visitar: (texto: string, onde: string) => void,
): void {
  if (typeof valor === "string") {
    visitar(valor, caminho);
  } else if (Array.isArray(valor)) {
    valor.forEach((v, i) => cadaTexto(v, `${caminho}[${i}]`, visitar));
  } else if (valor && typeof valor === "object") {
    for (const [k, v] of Object.entries(valor)) {
      cadaTexto(v, `${caminho}.${k}`, visitar);
    }
  }
}

/** Conjuntos de conteúdo, com o nome que aparece no relatório. */
const CONTEUDO: Record<string, unknown> = {
  ativos,
  dicas,
  eventos,
  indicadores,
  ipos,
  noticias,
  oportunidades,
  radar,
  edicao,
  termos,
};

/**
 * Regra 1 — nenhum `[[termo]]` órfão.
 *
 * É a que motivou o arquivo. Um chip órfão degrada para texto simples
 * em produção (ver `<Texto>`), então o leitor não vê erro nenhum: ele
 * só não recebe a explicação que o texto prometeu. Falha silenciosa é
 * exatamente o tipo que precisa quebrar o build.
 */
export function termosOrfaos(): Problema[] {
  const problemas: Problema[] = [];

  for (const [nome, dados] of Object.entries(CONTEUDO)) {
    cadaTexto(dados, nome, (texto, onde) => {
      for (const m of texto.matchAll(MARCACAO)) {
        if (!existeTermo(m[1])) {
          problemas.push({ onde, o_que: `termo "${m[1]}" não existe no glossário` });
        }
      }
    });
  }

  return problemas;
}

/** Regra 2 — o glossário fecha em si mesmo. */
export function glossarioConsistente(): Problema[] {
  const problemas: Problema[] = [];
  const vistos = new Set<string>();

  for (const t of termos) {
    const onde = `termos.${t.slug}`;

    if (vistos.has(t.slug)) {
      problemas.push({ onde, o_que: "slug duplicado" });
    }
    vistos.add(t.slug);

    for (const r of t.relacionados) {
      if (r === t.slug) {
        problemas.push({ onde, o_que: "relacionado aponta para o próprio termo" });
      } else if (!existeTermo(r)) {
        problemas.push({ onde, o_que: `relacionado "${r}" não existe` });
      }
    }
  }

  return problemas;
}

/**
 * Regra 3 — todo dado carrega procedência utilizável.
 *
 * O tipo `ComFonte` garante que o campo existe. Não garante que a
 * lista tem alguém dentro nem que a data é uma data — e é `fontes[0]`
 * que a assinatura imprime embaixo de cada número.
 */
export function procedenciaCompleta(): Problema[] {
  const problemas: Problema[] = [];

  const comFonte: [string, { fontes: { nome: string; publicadoEm: string }[] }[]][] = [
    ["ativos", ativos],
    ["indicadores", indicadores],
    ["noticias", noticias],
    ["radar", radar],
    ["ipos", ipos],
    ["eventos", eventos],
  ];

  for (const [nome, lista] of comFonte) {
    lista.forEach((item, i) => {
      const onde = `${nome}[${i}]`;

      if (item.fontes.length === 0) {
        problemas.push({ onde, o_que: "sem nenhuma fonte" });
        return;
      }

      item.fontes.forEach((f, j) => {
        if (!f.nome.trim()) {
          problemas.push({ onde: `${onde}.fontes[${j}]`, o_que: "fonte sem nome" });
        }
        if (Number.isNaN(Date.parse(f.publicadoEm))) {
          problemas.push({
            onde: `${onde}.fontes[${j}]`,
            o_que: `data inválida: "${f.publicadoEm}"`,
          });
        }
      });
    });
  }

  return problemas;
}

/**
 * Regra 4 — nenhuma tese sem o que a invalidaria.
 *
 * É o campo que separa análise de palpite com formatação bonita. Em
 * branco, ele passa pelo compilador e some da tela sem aviso.
 */
export function teseComInvalidacao(): Problema[] {
  const problemas: Problema[] = [];

  radar.forEach((r) => {
    if (!r.invalidaria.trim()) {
      problemas.push({ onde: `radar.${r.id}`, o_que: "invalidaria em branco" });
    }
  });

  ativos.forEach((a) => {
    if (a.radar && !a.radar.invalidaria.trim()) {
      problemas.push({ onde: `ativos.${a.ticker}.radar`, o_que: "invalidaria em branco" });
    }
  });

  return problemas;
}

/**
 * Regra 5 — status que afirma que a oferta existe exige fonte oficial.
 *
 * "Em andamento" com fonte de jornal é tratar rumor como fato, que é
 * a coisa que o produto declara não fazer.
 *
 * Conteúdo de protótipo (`natureza: "exemplo"`) não tem como ter fonte
 * primária — a companhia não existe. Aplicar a regra a ele deixaria a
 * validação permanentemente vermelha, e regra sempre vermelha é regra
 * que ninguém lê. Para esse caso vale a regra 5b, abaixo: o que não
 * pode acontecer é a oferta aparecer na tela como confirmada.
 */
export function ofertasSustentadas(): Problema[] {
  return ipos
    .filter((i) => i.natureza !== "exemplo" && !statusSustentado(i))
    .map((i) => ({
      onde: `ipos.${i.slug}`,
      o_que: `status "${i.status}" exige fonte primária (CVM, B3 ou a própria companhia)`,
    }));
}

/**
 * Regra 5b — o status escrito nunca é a autoridade na tela.
 *
 * Uma oferta sem fonte primária só pode aparecer no grupo de não
 * confirmados, independentemente do que o campo `status` diga. É o
 * comportamento que `separarIpos` implementa; aqui ele vira teste, e
 * não convenção que alguém pode contornar montando a lista à mão.
 */
export function ofertasNaoConfirmadasSeparadas(): Problema[] {
  return separarIpos(ipos)
    .confirmados.filter((i) => !statusSustentado(i))
    .map((i) => ({
      onde: `ipos.${i.slug}`,
      o_que: "apresentada como confirmada sem fonte primária",
    }));
}

/** Regra 6 — toda referência interna aponta para algo que existe. */
export function referenciasInternas(): Problema[] {
  const problemas: Problema[] = [];
  const tickers = new Set(ativos.map((a) => a.ticker));
  const ids = new Set(indicadores.map((i) => i.id));

  radar.forEach((r) => {
    if (r.ticker && !tickers.has(r.ticker)) {
      problemas.push({ onde: `radar.${r.id}`, o_que: `ticker "${r.ticker}" sem página` });
    }
  });

  noticias.forEach((n) => {
    n.analise.relacionados.forEach((t) => {
      if (!tickers.has(t)) {
        problemas.push({
          onde: `noticias.${n.slug}.analise`,
          o_que: `relacionado "${t}" sem página de ativo`,
        });
      }
    });
  });

  [
    ["NA_FAIXA", NA_FAIXA],
    ["NO_HERO", NO_HERO],
  ].forEach(([nome, lista]) => {
    (lista as readonly string[]).forEach((id) => {
      if (!ids.has(id)) {
        problemas.push({ onde: nome as string, o_que: `indicador "${id}" não existe` });
      }
    });
  });

  ativos.forEach((a) => {
    a.indicadores.forEach((ind) => {
      if (ind.termo && !existeTermo(ind.termo)) {
        problemas.push({
          onde: `ativos.${a.ticker}`,
          o_que: `rótulo "${ind.rotulo}" aponta para termo inexistente "${ind.termo}"`,
        });
      }
    });
  });

  return problemas;
}

/**
 * TICKER REAL NUNCA RECEBE TESE.
 *
 * Esta é a regra que a entrada de dados reais tornou necessária, e é
 * a mais importante do arquivo.
 *
 * O produto inventa empresas de propósito: escrever "cautela por
 * alavancagem" sobre uma companhia real, com número que ninguém
 * apurou, produz exatamente o artefato que ele existe para não
 * produzir — e um print dessa página não teria como se defender.
 *
 * Cotação real não resolve isso; agrava. Com PETR4 na tela, qualquer
 * texto ao lado vira análise sobre a Petrobras. O acordo, então: o
 * robô traz preço, fonte e horário para papel real, e a camada de
 * interpretação continua restrita a classe de ativo e macroeconomia,
 * onde afirmar algo não é falar de uma empresa específica.
 *
 * O compilador não pega isso — os dois campos são strings válidas.
 * Esta regra pega, e falha o build.
 */
export function tickerRealSemTese(): Problema[] {
  const problemas: Problema[] = [];
  const reais = new Set(TICKERS);

  for (const a of ativos) {
    if (!reais.has(a.ticker)) continue;

    if (a.natureza === "analise" || a.natureza === "exemplo") {
      problemas.push({
        onde: `ativo ${a.ticker}`,
        o_que: `empresa real com natureza "${a.natureza}". Papel real só pode carregar dado apurado.`,
      });
    }

    if (a.radar) {
      problemas.push({
        onde: `ativo ${a.ticker}`,
        o_que:
          "empresa real com tese escrita. Remova a tese ou troque por uma empresa fictícia — " +
          "análise sobre companhia real precisa de apuração, não de redação de protótipo.",
      });
    }
  }

  for (const r of radar) {
    if (r.ticker && reais.has(r.ticker)) {
      problemas.push({
        onde: `radar ${r.id}`,
        o_que: `entrada de radar sobre ${r.ticker}, que é empresa real. O radar cobre classe e macro, não companhia.`,
      });
    }
  }

  return problemas;
}

/**
 * NÚMERO CRAVADO NA PROSA AO LADO DE UM INDICADOR APURADO.
 *
 * O caso que originou a regra: a edição dizia "o [[copom]] manteve a
 * [[selic]] em 10,50%" enquanto a faixa do topo, três centímetros
 * acima, mostrava 14,00% vindo do Banco Central. A frase era
 * verdadeira quando foi escrita e virou mentira sozinha, em
 * silêncio, no dia em que a ingestão entrou.
 *
 * Revisar o texto não resolve de forma durável — o próximo número
 * cravado envelhece igual. O que resolve é a marcação `{{selic}}`,
 * que busca o valor no render. Esta regra existe para tornar o
 * esquecimento impossível: número literal grudado num indicador
 * apurado derruba o build.
 *
 * Só vale para indicador APURADO. Enquanto o número é de protótipo,
 * texto e faixa são fictícios juntos e coerentes entre si — o
 * problema nasce da mistura, não da ficção.
 *
 * ── Por que a preposição importa ──
 *
 * A primeira versão marcava qualquer número perto da menção, e
 * acusou "Travar [[ipca]] mais 6% por dez anos" — onde 6% é o juro
 * real SOMADO ao índice, não o valor dele. Uma regra que grita à toa
 * acaba desligada, e aí para de pegar o caso de verdade.
 *
 * O que separa os dois é a ligação entre a menção e o número:
 *
 *   "manteve a [[selic]] EM 10,50%"   o número é o valor  → acusa
 *   "[[ipca]] MAIS 6%"                o número é acréscimo → passa
 *
 * Só "em", "a", "aos" e "para" afirmam que o indicador vale aquilo.
 */
export function numeroCravadoNaProsa(): Problema[] {
  const problemas: Problema[] = [];

  // A menção, uma preposição que atribui valor, e o número. Só isso
  // conta: qualquer outra coisa entre os dois já não é "o indicador
  // vale tanto".
  const ATRIBUI =
    /^\s*(?:está|ficou|segue|permanece|encerrou|fechou|foi)?\s*(?:em|a|aos|para)\s+(\d+[.,]?\d*\s*%)/i;
  const PERTO = 40;

  const textos: [string, string][] = [
    ["edicao.chamada", edicao.chamada],
    ["edicao.riscoDoDia", edicao.riscoDoDia],
    ...edicao.sessenta.map((t, i): [string, string] => [`edicao.sessenta[${i}]`, t]),
    ...radar.map((r): [string, string] => [`radar.${r.id}.tese`, r.tese]),
  ];

  for (const [onde, texto] of textos) {
    const re = new RegExp(MARCACAO.source, "g");
    let m: RegExpExecArray | null;

    while ((m = re.exec(texto)) !== null) {
      const slug = m[1].toLowerCase();
      const ind = indicadores.find((i) => i.id === slug);
      if (!ind || ind.natureza !== "apurado") continue;

      const depois = texto.slice(m.index + m[0].length, m.index + m[0].length + PERTO);
      const achado = depois.match(ATRIBUI);
      if (!achado) continue;

      problemas.push({
        onde,
        o_que:
          `"${achado[1]}" cravado logo depois de [[${slug}]], que hoje é apurado ` +
          `(${ind.valor}${ind.sufixo ?? ""}). Use {{${slug}}} para o valor buscar a si mesmo, ` +
          `ou reescreva a frase sem o número.`,
      });
    }
  }

  return problemas;
}

/**
 * `{{indicador}}` que não existe.
 *
 * O mesmo raciocínio do `[[termo]]` órfão: marcação errada é
 * detectável, então detectá-la é obrigação. Sem isto, `{{selik}}`
 * chegaria cru à tela.
 */
export function valoresOrfaos(): Problema[] {
  const problemas: Problema[] = [];
  const ids = new Set(indicadores.map((i) => i.id));

  const textos: [string, string][] = [
    ["edicao.chamada", edicao.chamada],
    ["edicao.riscoDoDia", edicao.riscoDoDia],
    ...edicao.sessenta.map((t, i): [string, string] => [`edicao.sessenta[${i}]`, t]),
    ...radar.map((r): [string, string] => [`radar.${r.id}.tese`, r.tese]),
  ];

  for (const [onde, texto] of textos) {
    for (const id of valoresReferenciados(texto)) {
      if (!ids.has(id)) {
        problemas.push({ onde, o_que: `{{${id}}} não corresponde a nenhum indicador` });
      }
    }
  }

  return problemas;
}

export const REGRAS: { nome: string; rodar: () => Problema[] }[] = [
  { nome: "termos do glossário existem", rodar: termosOrfaos },
  { nome: "glossário consistente", rodar: glossarioConsistente },
  { nome: "procedência completa", rodar: procedenciaCompleta },
  { nome: "toda tese diz o que a invalidaria", rodar: teseComInvalidacao },
  { nome: "oferta afirmada tem fonte oficial", rodar: ofertasSustentadas },
  {
    nome: "oferta sem fonte primária não aparece como confirmada",
    rodar: ofertasNaoConfirmadasSeparadas,
  },
  { nome: "referências internas resolvem", rodar: referenciasInternas },
  { nome: "empresa real não carrega tese de protótipo", rodar: tickerRealSemTese },
  { nome: "valores {{}} existem", rodar: valoresOrfaos },
  { nome: "número apurado não fica cravado na prosa", rodar: numeroCravadoNaProsa },
];

export function validarTudo(): { nome: string; problemas: Problema[] }[] {
  return REGRAS.map((r) => ({ nome: r.nome, problemas: r.rodar() }));
}
