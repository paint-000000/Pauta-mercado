import type { EventoCalendario, Fonte, Ipo, StatusIpo } from "@/types";
import { STATUS_EXIGE_OFICIAL } from "@/types";

/**
 * ⚠️  EMPRESAS FICTÍCIAS, DE PROPÓSITO.
 *
 * A regra é categórica: nunca inventar IPO, nunca tratar rumor como
 * confirmado. Usar o nome de uma empresa real aqui — mesmo num
 * protótipo, mesmo com tarja — criaria exatamente o artefato que o
 * produto existe para impedir, e ele sobreviveria a um print de tela.
 *
 * Domínios abaixo são a lista branca do que conta como fonte primária.
 * A verificação é por domínio da URL, em código: não é o redator nem
 * o modelo que decide o que é oficial.
 */

const DOMINIOS_OFICIAIS = ["b3.com.br", "gov.br"];

const f = (nome: string, url?: string): Fonte => ({
  nome,
  url,
  publicadoEm: "2026-08-18T09:00:00-03:00",
});

export const ROTULO_STATUS: Record<StatusIpo, string> = {
  rumor: "Rumor",
  "em-estudo": "Em estudo",
  prospecto: "Prospecto divulgado",
  "em-andamento": "Oferta em andamento",
  precificado: "Precificado",
  encerrado: "Encerrado",
};

export const ipos: Ipo[] = [
  {
    slug: "aurora-saneamento",
    empresa: "Aurora Saneamento",
    setor: "Saneamento (exemplo)",
    mercado: "Novo Mercado",
    status: "prospecto",
    dataPrevista: "10 de setembro de 2026",
    faixaPreco: "R$ 18,00 a R$ 22,00",
    oQueE:
      "Empresa fictícia do protótipo. Seria uma concessionária de água e esgoto atuando em municípios de médio porte.",
    porQueImporta:
      "Concessões de saneamento têm receita regulada e contratos de décadas, o que costuma atrair investidor que busca previsibilidade. Isso não diz nada sobre o preço da oferta estar bom.",
    riscos: [
      "Empresa recém-listada não tem histórico de bolsa para comparação.",
      "Revisões tarifárias podem vir abaixo do previsto no plano de negócios.",
      "Investimento obrigatório em rede consome caixa nos primeiros anos.",
      "A faixa de preço pode mudar até a precificação.",
    ],
    oQueObservar: [
      "Definição do preço final, prevista para 9 de setembro",
      "Percentual da oferta destinado a pessoa física",
      "Destino dos recursos: expansão ou pagamento de dívida",
    ],
    fontes: [f("Dados de protótipo")],
    natureza: "exemplo",
  },
  {
    slug: "vertex-software",
    empresa: "Vertex Software",
    setor: "Tecnologia (exemplo)",
    mercado: "Novo Mercado",
    status: "em-estudo",
    oQueE:
      "Empresa fictícia do protótipo. Seria uma desenvolvedora de sistemas de gestão para pequenas e médias empresas.",
    porQueImporta:
      "Ainda não há documento oficial. Enquanto não houver, não existe informação em que basear qualquer decisão.",
    riscos: [
      "Estudo de abertura de capital frequentemente não se concretiza.",
      "Sem prospecto, não há números auditados disponíveis.",
      "Datas e valores que circulam antes do documento oficial costumam mudar.",
    ],
    oQueObservar: [
      "Protocolo de pedido de registro na CVM",
      "Contratação de bancos coordenadores",
    ],
    fontes: [f("Dados de protótipo")],
    natureza: "exemplo",
  },
  {
    slug: "campo-agro",
    empresa: "Campo Agro",
    setor: "Agronegócio (exemplo)",
    mercado: "Nível 2",
    status: "rumor",
    oQueE:
      "Empresa fictícia do protótipo. Seria uma produtora e processadora de grãos com operação no centro-oeste.",
    porQueImporta:
      "Circula no mercado, sem confirmação de nenhuma fonte primária. Serve para acompanhar, não para decidir.",
    riscos: [
      "Rumor sem confirmação oficial pode simplesmente não existir.",
      "Nenhuma informação financeira verificável disponível.",
    ],
    oQueObservar: ["Qualquer comunicado oficial da companhia ou da CVM"],
    fontes: [f("Dados de protótipo")],
    natureza: "exemplo",
  },
];

/* ---------------------------------------------------------- */

export function ehFonteOficial(fonte: Fonte): boolean {
  if (!fonte.url) return false;
  try {
    const host = new URL(fonte.url).hostname.toLowerCase();
    return DOMINIOS_OFICIAIS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/**
 * A regra crítica como código, não como recomendação.
 * Status que afirmam existência da oferta exigem fonte primária.
 */
export function statusSustentado(ipo: Ipo): boolean {
  if (!STATUS_EXIGE_OFICIAL.includes(ipo.status)) return true;
  return ipo.fontes.some(ehFonteOficial);
}

/**
 * Confirmados e não confirmados nunca compartilham a mesma lista.
 * Um item marcado como confirmado à mão, sem fonte oficial, cai para
 * o grupo de baixo — o status escrito não é a autoridade aqui.
 */
export function separarIpos(lista: Ipo[]): {
  confirmados: Ipo[];
  naoConfirmados: Ipo[];
} {
  const confirmados: Ipo[] = [];
  const naoConfirmados: Ipo[] = [];
  for (const ipo of lista) {
    const afirma = STATUS_EXIGE_OFICIAL.includes(ipo.status);
    if (afirma && statusSustentado(ipo)) confirmados.push(ipo);
    else naoConfirmados.push(ipo);
  }
  return { confirmados, naoConfirmados };
}

export function getIpo(slug: string): Ipo | undefined {
  return ipos.find((i) => i.slug === slug);
}

/* ================= Calendário econômico ================= */

export const eventos: EventoCalendario[] = [
  {
    id: "ata-copom",
    data: "2026-08-26",
    hora: "08:00",
    titulo: "Ata do Copom",
    tipo: "politica-monetaria",
    importancia: "alta",
    descricao:
      "Documento que detalha o raciocínio por trás da última decisão de juros.",
    porQueImporta:
      "É onde o Banco Central explica o que precisa acontecer para os juros começarem a cair.",
    fontes: [f("Banco Central", "https://www.bcb.gov.br")],
    natureza: "exemplo",
  },
  {
    id: "ipca-agosto",
    data: "2026-09-10",
    hora: "09:00",
    titulo: "IPCA de agosto",
    tipo: "indicador",
    importancia: "alta",
    descricao: "Índice oficial de inflação do mês.",
    porQueImporta:
      "A leitura de serviços é o que hoje trava a discussão de corte de juros.",
    fontes: [f("IBGE", "https://www.ibge.gov.br")],
    natureza: "exemplo",
  },
  {
    id: "payroll",
    data: "2026-09-04",
    hora: "09:30",
    titulo: "Payroll — Estados Unidos",
    tipo: "exterior",
    importancia: "alta",
    descricao: "Relatório mensal de criação de empregos americano.",
    porQueImporta:
      "Emprego fraco por lá reabre a discussão de corte de juros nos EUA e alivia moedas emergentes.",
    fontes: [f("Reuters")],
    natureza: "exemplo",
  },
  {
    id: "ipo-aurora",
    data: "2026-09-09",
    titulo: "Precificação — Aurora Saneamento",
    tipo: "oferta",
    importancia: "media",
    descricao: "Definição do preço final da oferta.",
    porQueImporta: "É quando a faixa indicativa vira preço de verdade.",
    fontes: [f("Dados de protótipo")],
    natureza: "exemplo",
  },
  {
    id: "pib-2tri",
    data: "2026-09-02",
    hora: "09:00",
    titulo: "PIB do segundo trimestre",
    tipo: "indicador",
    importancia: "media",
    descricao: "Medida do crescimento da economia no trimestre.",
    porQueImporta:
      "Atividade forte demais pressiona a inflação e adia corte de juros.",
    fontes: [f("IBGE", "https://www.ibge.gov.br")],
    natureza: "exemplo",
  },
  {
    id: "focus",
    data: "2026-08-24",
    hora: "08:25",
    titulo: "Boletim Focus",
    tipo: "indicador",
    importancia: "baixa",
    descricao: "Pesquisa semanal com projeções de economistas de mercado.",
    porQueImporta:
      "Mostra se o mercado está mudando de ideia sobre inflação e juros.",
    fontes: [f("Banco Central", "https://www.bcb.gov.br")],
    natureza: "exemplo",
  },
];

export const ROTULO_TIPO_EVENTO = {
  "politica-monetaria": "Política monetária",
  indicador: "Indicador",
  resultado: "Resultado",
  oferta: "Oferta",
  exterior: "Exterior",
} as const;
