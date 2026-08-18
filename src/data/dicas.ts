import type { ClasseSim } from "@/lib/simulador";

export type CategoriaDica =
  | "comecar"
  | "erros"
  | "renda-fixa"
  | "bolsa"
  | "impostos"
  | "habitos";

export type Dica = {
  id: string;
  categoria: CategoriaDica;
  titulo: string;
  /** A dica em si. Uma ou duas frases, na voz de quem orienta. */
  texto: string;
  /** O motivo. Sem ele a dica vira regra decorada. */
  porque: string;
  /**
   * Exemplo com número. É o que transforma "taxa pequena importa" em
   * algo que a pessoa consegue conferir na própria cabeça.
   */
  exemplo?: string;
  /** Classes do simulador em que esta dica muda a decisão. */
  aplicaA?: ClasseSim[];
  destaque?: boolean;
};

export const ROTULO_CATEGORIA_DICA: Record<CategoriaDica, string> = {
  comecar: "Para começar",
  erros: "Erros comuns",
  "renda-fixa": "Renda fixa",
  bolsa: "Bolsa",
  impostos: "Impostos e custos",
  habitos: "Hábitos",
};

/**
 * Dicas práticas.
 *
 * Três camadas educacionais no site, e elas não se sobrepõem: o
 * glossário DEFINE um termo, a análise INTERPRETA um dado, a dica
 * ORIENTA uma prática.
 *
 * Regra editorial: nenhuma dica manda comprar nada e nenhuma promete
 * resultado. Toda dica traz o "por quê" — sem ele vira regra decorada,
 * e regra decorada é abandonada no primeiro caso que não se encaixa.
 *
 * Os números dos exemplos são ilustrativos e arredondados de
 * propósito: servem para dar ordem de grandeza, não para ser copiados
 * como projeção.
 */
export const dicas: Dica[] = [
  {
    id: "reserva-primeiro",
    categoria: "comecar",
    titulo: "Reserva antes de qualquer investimento",
    texto:
      "Antes de pensar em rendimento, tenha um dinheiro que você consiga sacar hoje. Costuma-se falar em três a seis meses das suas despesas.",
    porque:
      "Sem essa folga, qualquer imprevisto obriga a vender o que estiver disponível — quase sempre no pior momento possível.",
    exemplo:
      "Gastando R$ 3.000 por mês, a reserva fica entre R$ 9.000 e R$ 18.000. É a primeira meta, não a última.",
    aplicaA: ["reserva"],
    destaque: true,
  },
  {
    id: "prazo-manda",
    categoria: "comecar",
    titulo: "O prazo decide mais que o seu perfil",
    texto:
      "Dinheiro que você vai usar em menos de um ano não deveria oscilar, mesmo que você tolere bem oscilação.",
    porque:
      "Tolerância a risco é sobre o que você aguenta emocionalmente. Prazo é sobre quanto tempo o mercado tem para se recuperar de uma queda. O segundo é aritmética, não temperamento.",
    exemplo:
      "A bolsa brasileira já levou mais de três anos para recuperar quedas fortes. Quem precisava do dinheiro em um ano não teve escolha.",
    aplicaA: ["etf-brasil", "acoes", "fii"],
    destaque: true,
  },
  {
    id: "comece-pequeno",
    categoria: "comecar",
    titulo: "Comece com um valor que não te assuste",
    texto:
      "O primeiro investimento não precisa ser o melhor. Precisa ser o que te faz entender como tudo funciona na prática.",
    porque:
      "Aprender o caminho — transferir, comprar, ver o extrato, resgatar — vale mais no começo do que meio ponto percentual de rendimento.",
    exemplo:
      "Um título público custa a partir de cerca de R$ 30. Dá para percorrer o processo inteiro com menos de R$ 50.",
    aplicaA: ["reserva", "tesouro-ipca"],
  },
  {
    id: "nao-persiga",
    categoria: "erros",
    titulo: "Não persiga o que subiu muito",
    texto:
      "Rendimento passado é a informação mais fácil de encontrar e a menos útil para decidir.",
    porque:
      "Quando um ativo aparece nas manchetes por ter subido, boa parte do movimento já aconteceu. Comprar depois da notícia costuma ser comprar caro.",
    destaque: true,
  },
  {
    id: "diversifique",
    categoria: "erros",
    titulo: "Não concentre tudo numa única aposta",
    texto:
      "Espalhar entre coisas diferentes reduz o estrago quando uma delas dá errado — e alguma sempre dá.",
    porque:
      "Concentração amplifica os dois lados. A questão não é se você vai errar alguma escolha, é quanto cada erro vai custar.",
    exemplo:
      "Com 5% em uma ação, uma queda de 50% nela custa 2,5% da carteira. Com 100%, custa metade de tudo.",
    aplicaA: ["acoes", "etf-brasil"],
  },
  {
    id: "nao-acompanhe-diario",
    categoria: "erros",
    titulo: "Acompanhar todo dia atrapalha",
    texto:
      "Se o seu horizonte é de anos, olhar a cotação diariamente só adiciona ansiedade sem adicionar informação.",
    porque:
      "A oscilação diária é ruído. Quem acompanha de perto tende a mexer mais na carteira, e mexer mais costuma render menos.",
  },
  {
    id: "nao-e-fixa",
    categoria: "renda-fixa",
    titulo: "Renda fixa também oscila",
    texto:
      "“Fixa” quer dizer que a regra de rendimento é conhecida desde o início — não que o preço não varia até o vencimento.",
    porque:
      "Títulos longos podem aparecer no negativo antes do vencimento. Quem carrega até o fim recebe o combinado; quem precisa vender antes, não.",
    exemplo:
      "Num título com duration de 7 anos, uma alta de 1% no juro derruba o preço em cerca de 7% — mesmo sendo renda fixa.",
    aplicaA: ["tesouro-ipca"],
    destaque: true,
  },
  {
    id: "escolha-vencimento",
    categoria: "renda-fixa",
    titulo: "Escolha o vencimento pela sua data, não pela taxa",
    texto:
      "Entre dois títulos da mesma família, o mais longo quase sempre paga mais. Isso não o torna melhor para você.",
    porque:
      "A taxa maior é a compensação por ficar mais tempo exposto. Se você precisa do dinheiro antes do vencimento, essa compensação vira risco de preço.",
    exemplo:
      "IPCA+ 2029 pagando 6,18% e IPCA+ 2045 pagando 6,55%: a diferença de 0,37% não compensa carregar 16 anos a mais do que você precisa.",
    aplicaA: ["tesouro-ipca"],
  },
  {
    id: "liquidez-antes-taxa",
    categoria: "renda-fixa",
    titulo: "Confira a liquidez antes da taxa",
    texto:
      "Um rendimento melhor não serve de nada se o dinheiro só puder ser resgatado daqui a três anos e você precisar dele em seis meses.",
    porque:
      "Liquidez é a característica que você mais sente quando dá errado, e a que menos aparece nas comparações de rendimento.",
    aplicaA: ["reserva"],
  },
  {
    id: "cdi-referencia",
    categoria: "renda-fixa",
    titulo: "Use o CDI como régua, não como meta",
    texto:
      "Comparar uma aplicação com o CDI diz se ela paga bem pelo risco que tem — não se ela é adequada para você.",
    porque:
      "Um produto pode render 120% do CDI e ainda assim ser inadequado se travar seu dinheiro por um prazo que você não tem.",
    aplicaA: ["reserva"],
  },
  {
    id: "etf-antes-de-acao",
    categoria: "bolsa",
    titulo: "ETF costuma ser um começo mais suave que ação",
    texto:
      "Com uma compra você fica exposto a dezenas de empresas, sem precisar acertar qual delas vai bem.",
    porque:
      "Escolher empresa exige acompanhar balanço, setor e concorrência. Um índice remove essa exigência sem remover a exposição à bolsa.",
    aplicaA: ["etf-brasil", "etf-exterior", "acoes"],
  },
  {
    id: "dividend-yield-alto",
    categoria: "bolsa",
    titulo: "Desconfie de dividend yield muito alto",
    texto:
      "O indicador é uma divisão: dividendo dividido por preço. Ele sobe quando o pagamento aumenta — e também quando o preço despenca.",
    porque:
      "Um yield que saltou sem que a empresa tenha melhorado normalmente está sinalizando queda de preço, não generosidade.",
    exemplo:
      "Uma cota de R$ 100 que paga R$ 9 rende 9%. Se a cota cair para R$ 70 e o pagamento continuar igual, o yield “sobe” para 12,8% — sem nada ter melhorado.",
    aplicaA: ["fii", "acoes"],
  },
  {
    id: "cambio-conta",
    categoria: "bolsa",
    titulo: "No exterior, o câmbio conta tanto quanto a bolsa",
    texto:
      "Investindo lá fora sem proteção cambial, seu resultado tem duas partes: o desempenho das empresas e a variação do dólar.",
    porque:
      "Real se valorizando corrói o retorno mesmo com a bolsa de lá subindo — e o contrário também vale.",
    exemplo:
      "Bolsa americana subindo 10% com o dólar caindo 10% deixa o resultado em reais perto de zero.",
    aplicaA: ["etf-exterior"],
  },
  {
    id: "tese-e-saida",
    categoria: "bolsa",
    titulo: "Antes de entrar, escreva o que te faria sair",
    texto:
      "Se você não consegue dizer o que invalidaria a sua escolha, provavelmente não tem uma tese — tem uma torcida.",
    porque:
      "Definir isso antes evita a decisão no calor da queda, que é quando ela costuma ser pior.",
    aplicaA: ["acoes", "fii"],
    destaque: true,
  },
  {
    id: "custo-corroi",
    categoria: "impostos",
    titulo: "Taxa pequena, prazo longo, estrago grande",
    texto:
      "Uma diferença de 1% ao ano em taxa parece irrelevante e não é: em vinte anos ela come uma fatia considerável do resultado.",
    porque:
      "A taxa incide todo ano sobre o total acumulado, inclusive sobre o rendimento que você já teve. Ela compõe contra você.",
    exemplo:
      "Em vinte anos, 1% ao ano de taxa consome cerca de 18% do montante final. É quase um quinto do resultado.",
    aplicaA: ["etf-brasil", "etf-exterior"],
  },
  {
    id: "tabela-regressiva",
    categoria: "impostos",
    titulo: "Sair cedo da renda fixa custa imposto",
    texto:
      "Na maioria das aplicações de renda fixa, o imposto sobre o rendimento cai conforme você fica mais tempo.",
    porque:
      "Resgatar nos primeiros meses paga a alíquota mais alta. O mesmo investimento entrega líquidos bem diferentes só por causa da data de saída.",
    exemplo:
      "A alíquota vai de 22,5% no começo até 15% depois de dois anos. Um resgate apressado pode custar mais que a diferença de taxa que te fez escolher o produto.",
    aplicaA: ["reserva", "tesouro-ipca"],
  },
  {
    id: "come-cotas",
    categoria: "impostos",
    titulo: "Entenda quando o imposto é cobrado",
    texto:
      "Alguns investimentos descontam imposto só no resgate; outros recolhem periodicamente, mesmo sem você mexer em nada.",
    porque:
      "Antecipar imposto reduz o valor que continua rendendo. Dois produtos com o mesmo rendimento bruto podem entregar líquidos bem diferentes.",
  },
  {
    id: "aporte-regular",
    categoria: "habitos",
    titulo: "Regularidade vence tentativa de acertar o momento",
    texto:
      "Investir um valor fixo todo mês costuma funcionar melhor do que esperar o momento certo para entrar.",
    porque:
      "Aportando sempre, você compra caro às vezes e barato outras. Esperando o momento ideal, normalmente você fica de fora.",
    exemplo:
      "R$ 200 por mês somam R$ 2.400 no ano — mais do que a maioria consegue separar de uma vez só.",
    destaque: true,
  },
  {
    id: "revise-pouco",
    categoria: "habitos",
    titulo: "Reveja a carteira em intervalos longos",
    texto:
      "Uma revisão a cada seis meses ou um ano é suficiente para a maioria das pessoas.",
    porque:
      "Revisão frequente demais transforma ruído em decisão. O intervalo longo obriga a olhar tendência, não oscilação.",
  },
  {
    id: "escreva-objetivo",
    categoria: "habitos",
    titulo: "Dê nome ao dinheiro",
    texto:
      "Saber para que serve cada parte — reserva, viagem, aposentadoria — resolve sozinho a maior parte das dúvidas sobre onde colocá-la.",
    porque:
      "O objetivo define o prazo, e o prazo define o que é adequado. Sem nome, todo dinheiro parece igual e a decisão fica arbitrária.",
    destaque: true,
  },
];

export const ORDEM_CATEGORIAS: CategoriaDica[] = [
  "comecar",
  "erros",
  "renda-fixa",
  "bolsa",
  "impostos",
  "habitos",
];

export function dicasPorCategoria(): [CategoriaDica, Dica[]][] {
  return ORDEM_CATEGORIAS.map((c) => [c, dicas.filter((d) => d.categoria === c)]);
}

export const dicasDestaque = dicas.filter((d) => d.destaque);

/** Dicas que mudam a decisão numa classe do simulador. */
export function dicasDaClasse(classe: ClasseSim): Dica[] {
  return dicas.filter((d) => d.aplicaA?.includes(classe));
}
