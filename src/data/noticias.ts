import type { Fonte, Noticia } from "@/types";

/**
 * ⚠️  CONTEÚDO DE PROTÓTIPO
 *
 * Os textos são escritos à mão para prototipar a estrutura editorial.
 * A separação que importa está no tipo: `corpo` é o que seria apurado,
 * `analise` é o que a IA produz em cima disso. Nunca se misturam na
 * página, e a análise sempre carrega as fontes que a sustentam.
 */

const f = (nome: string, publicadoEm: string, url?: string): Fonte => ({
  nome,
  url,
  publicadoEm,
});

export const noticias: Noticia[] = [
  {
    slug: "copom-mantem-selic",
    chapeu: "Política monetária",
    titulo: "Banco Central mantém a Selic e sinaliza paciência",
    resumo:
      "O Copom decidiu manter a taxa básica de juros pela terceira reunião seguida e retirou do comunicado a menção a cortes no curto prazo.",
    categoria: "economia",
    publicadoEm: "2026-08-18T18:35:00-03:00",
    destaque: true,
    imagem: { cor: "#24241d", legenda: "Política monetária" },
    corpo: [
      "O Comitê de Política Monetária decidiu manter a [[selic]] no patamar atual, em decisão unânime. É a terceira reunião consecutiva sem alteração.",
      "No comunicado, o comitê retirou a expressão que indicava disposição para iniciar cortes nas próximas reuniões e passou a condicionar qualquer movimento à trajetória da [[inflacao]] de serviços, que segue acima da média histórica.",
      "O mercado de juros reagiu com alta nas taxas de [[di|DI futuro]] mais curtas, sinal de que investidores passaram a projetar o início do afrouxamento para depois do que se esperava.",
    ],
    fontes: [
      f("Banco Central", "2026-08-18T18:30:00-03:00", "https://www.bcb.gov.br"),
    ],
    natureza: "exemplo",
    analise: {
      resumo:
        "Juros parados por mais tempo do que o mercado esperava. Na prática, a renda fixa continua entregando retorno alto sem exigir que você aceite oscilação.",
      impacto:
        "Beneficia quem está em [[renda-fixa]] pós-fixada e quem ainda vai aplicar. Pressiona setores que dependem de crédito para crescer, porque o custo de tomar dinheiro emprestado segue elevado. Fundos imobiliários de tijolo tendem a andar de lado enquanto a comparação com a renda fixa continuar tão favorável a ela.",
      relacionados: ["TESOURO-IPCA-2035", "MRDA11", "ETFI11"],
      cenarios: [
        {
          tipo: "positivo",
          texto:
            "A inflação de serviços cede nos próximos dois meses e o comitê volta a sinalizar corte. Nesse caso, títulos longos prefixados e atrelados à inflação se valorizam antes do primeiro corte efetivo.",
        },
        {
          tipo: "neutro",
          texto:
            "Os juros ficam onde estão até o fim do ano. A renda fixa segue rendendo bem e a bolsa anda de lado, sem gatilho para uma direção clara.",
        },
        {
          tipo: "negativo",
          texto:
            "A inflação volta a acelerar e o comitê retoma a discussão de alta. Aí títulos longos caem de preço e a bolsa sofre com o custo de capital maior.",
        },
      ],
      acompanhar: [
        "IPCA de agosto, divulgado em 10 de setembro",
        "Ata do Copom, em 26 de agosto",
        "Boletim Focus semanal, toda segunda-feira",
        "Comportamento das taxas de DI de 1 e 3 anos",
      ],
      geradoEm: "2026-08-18T18:52:00-03:00",
      modelo: "protótipo · conteúdo fixo",
    },
  },
  {
    slug: "inflacao-servicos-desacelera",
    chapeu: "Inflação",
    titulo: "Inflação de serviços desacelera pelo segundo mês",
    resumo:
      "O componente mais resistente do índice cedeu, mas segue acima da média histórica e continua no centro da decisão do Banco Central.",
    categoria: "economia",
    publicadoEm: "2026-08-18T11:10:00-03:00",
    imagem: { cor: "#3a3a31", legenda: "Índices de preço" },
    corpo: [
      "O grupo de serviços do [[ipca]] desacelerou na leitura mais recente, puxado por transporte e alimentação fora do domicílio.",
      "Ainda assim, o item continua acima do que o Banco Central considera compatível com a meta, e é justamente ele que sustenta o tom cauteloso do último comunicado do [[copom]].",
    ],
    fontes: [f("IBGE", "2026-08-18T09:00:00-03:00", "https://www.ibge.gov.br")],
    natureza: "exemplo",
    analise: {
      resumo:
        "É a parte da inflação que mais demora a ceder. Dois meses de queda são um bom sinal, mas ainda não é tendência confirmada.",
      impacto:
        "Se a desaceleração continuar, abre caminho para cortes de juros mais cedo — o que favoreceria títulos longos e a bolsa. Por enquanto, não muda nada no bolso de quem investe.",
      relacionados: ["TESOURO-IPCA-2035", "ETFI11"],
      cenarios: [
        {
          tipo: "positivo",
          texto:
            "Terceiro mês seguido de queda confirmaria a tendência e antecipa a expectativa de corte.",
        },
        {
          tipo: "neutro",
          texto: "Estabilização no nível atual mantém o Banco Central parado.",
        },
        {
          tipo: "negativo",
          texto:
            "Repique em serviços empurraria a discussão de corte para o ano que vem.",
        },
      ],
      acompanhar: [
        "IPCA-15 de setembro",
        "Índice de difusão da inflação",
        "Dados de emprego e renda",
      ],
      geradoEm: "2026-08-18T11:40:00-03:00",
      modelo: "protótipo · conteúdo fixo",
    },
  },
  {
    slug: "juro-real-abre-janela",
    chapeu: "Renda fixa",
    titulo: "Juro real acima de 6% recoloca títulos longos no radar",
    resumo:
      "Com a taxa real dos títulos atrelados à inflação em patamar historicamente alto, gestores voltaram a discutir alongamento de carteira.",
    categoria: "renda-fixa",
    publicadoEm: "2026-08-18T15:05:00-03:00",
    imagem: { cor: "#0a5f47", legenda: "Renda fixa" },
    corpo: [
      "Os títulos públicos atrelados à [[ipca|inflação]] com vencimento longo voltaram a negociar com taxa real acima de 6% ao ano.",
      "Historicamente, janelas com esse nível de juro real não se sustentam por muitos trimestres — o que costuma reacender a discussão sobre alongar prazo em carteiras de longo prazo.",
      "O contraponto é o risco de marcação: quem precisa vender antes do vencimento fica exposto à oscilação do preço, que pode ser relevante em títulos de [[duration]] alta.",
    ],
    fontes: [
      f(
        "Tesouro Direto",
        "2026-08-18T14:00:00-03:00",
        "https://www.tesourodireto.com.br",
      ),
    ],
    natureza: "exemplo",
    analise: {
      resumo:
        "Dá para travar um ganho acima da inflação por mais de dez anos numa taxa que raramente aparece.",
      impacto:
        "Interessa a quem tem horizonte longo e não vai precisar do dinheiro no caminho. Não serve para reserva de emergência — o preço oscila até o vencimento.",
      relacionados: ["TESOURO-IPCA-2035"],
      cenarios: [
        {
          tipo: "positivo",
          texto:
            "Juros começam a cair e o título se valoriza antes do vencimento, somando ganho de preço ao rendimento contratado.",
        },
        {
          tipo: "neutro",
          texto:
            "Carregando até o vencimento, o resultado é o contratado: inflação mais a taxa do dia da compra.",
        },
        {
          tipo: "negativo",
          texto:
            "Piora fiscal empurra o juro real para cima e o preço cai. Quem precisar vender antes realiza prejuízo.",
        },
      ],
      acompanhar: [
        "Leilões do Tesouro às terças e quintas",
        "Resultado primário do governo central",
        "Curva de juros longa",
      ],
      geradoEm: "2026-08-18T15:30:00-03:00",
      modelo: "protótipo · conteúdo fixo",
    },
  },
  {
    slug: "bolsa-fecha-em-alta",
    chapeu: "Mercados",
    titulo: "Ibovespa fecha em alta com commodities e bancos",
    resumo:
      "O índice avançou puxado por siderurgia e pelo setor financeiro, em sessão de volume acima da média.",
    categoria: "mercados",
    publicadoEm: "2026-08-18T17:40:00-03:00",
    imagem: { cor: "#55554a", legenda: "Bolsa" },
    corpo: [
      "O [[ibovespa]] encerrou o pregão em alta, com destaque para siderurgia e bancos.",
      "O volume ficou acima da média das últimas vinte sessões, o que costuma indicar participação de investidor institucional e não apenas ajuste técnico.",
    ],
    fontes: [f("B3", "2026-08-18T17:30:00-03:00", "https://www.b3.com.br")],
    natureza: "exemplo",
    analise: {
      resumo:
        "Um dia de alta não muda nada para quem investe pensando em anos.",
      impacto:
        "Serve como leitura de humor do mercado, não como sinal para agir. Acompanhar o fechamento diário costuma atrapalhar mais que ajudar quem tem horizonte longo.",
      relacionados: ["ETFI11", "NRTE3"],
      cenarios: [
        {
          tipo: "positivo",
          texto: "Sequência de altas com volume alto indicaria entrada de fluxo estrangeiro.",
        },
        { tipo: "neutro", texto: "Oscilação normal dentro da faixa das últimas semanas." },
        {
          tipo: "negativo",
          texto: "Alta isolada com volume caindo nos dias seguintes seria apenas ajuste técnico.",
        },
      ],
      acompanhar: [
        "Fluxo de investidor estrangeiro na B3",
        "Temporada de resultados do trimestre",
      ],
      geradoEm: "2026-08-18T17:55:00-03:00",
      modelo: "protótipo · conteúdo fixo",
    },
  },
  {
    slug: "fed-mantem-juros-eua",
    chapeu: "Exterior",
    titulo: "Fed mantém juros e mercado adia aposta de corte",
    resumo:
      "A decisão veio em linha com o esperado, mas o tom do comunicado levou investidores a empurrar a expectativa de afrouxamento.",
    categoria: "exterior",
    publicadoEm: "2026-08-17T16:00:00-03:00",
    imagem: { cor: "#2b3b35", legenda: "Estados Unidos" },
    corpo: [
      "O banco central americano manteve a taxa de juros de referência e reforçou que decisões futuras dependerão dos dados de inflação e emprego.",
      "Investidores reagiram adiando a expectativa do primeiro corte, movimento que costuma fortalecer o dólar frente a moedas emergentes.",
    ],
    fontes: [f("Reuters", "2026-08-17T15:30:00-03:00")],
    natureza: "exemplo",
    analise: {
      resumo:
        "Juro alto nos Estados Unidos por mais tempo tende a atrair dinheiro para lá e pressionar moedas de países emergentes.",
      impacto:
        "Afeta quem investe no exterior sem proteção cambial e, indiretamente, a bolsa brasileira — juro americano alto encarece o capital no mundo todo.",
      relacionados: ["EXTR11", "BTC"],
      cenarios: [
        {
          tipo: "positivo",
          texto: "Dados de emprego mais fracos reabrem a discussão de corte e aliviam emergentes.",
        },
        { tipo: "neutro", texto: "Juro parado até o fim do ano, sem movimento cambial relevante." },
        {
          tipo: "negativo",
          texto: "Inflação americana surpreende para cima e o dólar se fortalece mais.",
        },
      ],
      acompanhar: [
        "Payroll, primeira sexta-feira de cada mês",
        "CPI americano",
        "Ata do Fed",
      ],
      geradoEm: "2026-08-17T16:20:00-03:00",
      modelo: "protótipo · conteúdo fixo",
    },
  },
  {
    slug: "fiis-tijolo-pressionados",
    chapeu: "Fundos imobiliários",
    titulo: "Fundos de tijolo seguem pressionados pela renda fixa",
    resumo:
      "Com juro alto, a comparação entre rendimento de aluguel e título público continua desfavorável aos fundos imobiliários.",
    categoria: "fiis",
    publicadoEm: "2026-08-18T10:20:00-03:00",
    imagem: { cor: "#85601a", legenda: "Imobiliário" },
    corpo: [
      "Fundos imobiliários de imóveis físicos continuam negociando abaixo do valor patrimonial, num movimento que já dura vários trimestres.",
      "A explicação mais citada por gestores é a concorrência da [[renda-fixa]]: enquanto um título público entrega retorno parecido com menos oscilação, sobra pouco incentivo para assumir risco de vacância.",
    ],
    fontes: [f("B3", "2026-08-18T09:45:00-03:00", "https://www.b3.com.br")],
    natureza: "exemplo",
    analise: {
      resumo:
        "Não é um problema dos imóveis — é a matemática da comparação com a renda fixa enquanto o juro está alto.",
      impacto:
        "Quem já tem cotas vê o preço parado, mas continua recebendo o aluguel mensal. Quem for comprar encontra preço abaixo do patrimônio, com o risco de isso durar mais um bom tempo.",
      relacionados: ["MRDA11", "TESOURO-IPCA-2035"],
      cenarios: [
        {
          tipo: "positivo",
          texto: "Corte de juros inverteria a comparação e costuma reprecificar o setor rápido.",
        },
        { tipo: "neutro", texto: "Juro parado mantém o setor andando de lado, com renda mensal preservada." },
        {
          tipo: "negativo",
          texto: "Vacância subindo derrubaria o rendimento distribuído, que é o único sustento atual do preço.",
        },
      ],
      acompanhar: [
        "Relatórios gerenciais mensais dos fundos",
        "Taxa de vacância do mercado de galpões",
        "Curva de juros de médio prazo",
      ],
      geradoEm: "2026-08-18T10:45:00-03:00",
      modelo: "protótipo · conteúdo fixo",
    },
  },
];

const porSlug = new Map(noticias.map((n) => [n.slug, n]));

export function getNoticia(slug: string): Noticia | undefined {
  return porSlug.get(slug);
}

export const ROTULO_CATEGORIA: Record<Noticia["categoria"], string> = {
  economia: "Economia",
  mercados: "Mercados",
  acoes: "Ações",
  fiis: "FIIs",
  "renda-fixa": "Renda fixa",
  etfs: "ETFs",
  exterior: "Exterior",
  ipos: "IPOs",
};

export const manchete = noticias.find((n) => n.destaque) ?? noticias[0];
export const secundarias = noticias.filter((n) => n !== manchete);
