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
 * Três camadas de conteúdo educacional no site, e elas não se
 * sobrepõem: o glossário DEFINE um termo, a análise INTERPRETA um
 * dado, e a dica ORIENTA uma prática.
 *
 * Regra editorial: nenhuma dica manda comprar nada, e nenhuma promete
 * resultado. Toda dica traz o "por quê" — sem ele vira regra decorada,
 * e regra decorada é abandonada no primeiro caso que não se encaixa.
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
      "\"Fixa\" quer dizer que a regra de rendimento é conhecida desde o início — não que o preço não varia até o vencimento.",
    porque:
      "Títulos longos podem aparecer no negativo antes do vencimento. Quem carrega até o fim recebe o combinado; quem precisa vender antes, não.",
    destaque: true,
  },
  {
    id: "liquidez-antes-taxa",
    categoria: "renda-fixa",
    titulo: "Confira a liquidez antes da taxa",
    texto:
      "Um rendimento melhor não serve de nada se o dinheiro só puder ser resgatado daqui a três anos e você precisar dele em seis meses.",
    porque:
      "Liquidez é a característica que você mais sente quando dá errado, e a que menos aparece nas comparações de rendimento.",
  },
  {
    id: "cdi-referencia",
    categoria: "renda-fixa",
    titulo: "Use o CDI como régua, não como meta",
    texto:
      "Comparar uma aplicação com o CDI diz se ela paga bem pelo risco que ela tem — não se ela é adequada para você.",
    porque:
      "Um produto pode render 120% do CDI e ainda assim ser inadequado se travar seu dinheiro por um prazo que você não tem.",
  },
  {
    id: "etf-antes-de-acao",
    categoria: "bolsa",
    titulo: "ETF costuma ser um começo mais suave que ação",
    texto:
      "Com uma compra você fica exposto a dezenas de empresas, sem precisar acertar qual delas vai bem.",
    porque:
      "Escolher empresa exige acompanhar balanço, setor e concorrência. Um índice remove essa exigência sem remover a exposição à bolsa.",
  },
  {
    id: "dividend-yield-alto",
    categoria: "bolsa",
    titulo: "Desconfie de dividend yield muito alto",
    texto:
      "O indicador é uma divisão: dividendo dividido por preço. Ele sobe quando o pagamento aumenta — e também quando o preço despenca.",
    porque:
      "Um yield que saltou sem que a empresa tenha melhorado normalmente está sinalizando queda de preço, não generosidade.",
  },
  {
    id: "tese-e-saida",
    categoria: "bolsa",
    titulo: "Antes de entrar, escreva o que te faria sair",
    texto:
      "Se você não consegue dizer o que invalidaria a sua escolha, provavelmente não tem uma tese — tem uma torcida.",
    porque:
      "Definir isso antes evita a decisão no calor da queda, que é quando ela costuma ser pior.",
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
  },
];

export function dicasPorCategoria(): [CategoriaDica, Dica[]][] {
  const ordem: CategoriaDica[] = [
    "comecar",
    "erros",
    "renda-fixa",
    "bolsa",
    "impostos",
    "habitos",
  ];
  return ordem.map((c) => [c, dicas.filter((d) => d.categoria === c)]);
}

export const dicasDestaque = dicas.filter((d) => d.destaque);
