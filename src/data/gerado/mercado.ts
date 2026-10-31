/* GERADO POR scripts/atualizar.ts — NÃO EDITE À MÃO.

   Este arquivo é o retrato do mercado na última rodada do robô. Ele
   é versionado de propósito: o histórico do git vira o histórico do
   que o site mostrou, e dá para responder "o que estava na tela no
   dia X" sem guardar banco nenhum. */
import type { Manifesto } from "@/lib/fontes/tipos";

export const MERCADO: Manifesto = {
  "rodadoEm": "2026-10-31T00:58:07.408Z",
  "fontes": [
    {
      "nome": "Banco Central",
      "ok": true
    },
    {
      "nome": "B3 (brapi)",
      "ok": false,
      "erro": "BRAPI_TOKEN ausente — cotações de ações e do Ibovespa não foram atualizadas. Registre-se grátis em brapi.dev e adicione o token nos secrets do repositório."
    }
  ],
  "dados": {
    "selic": {
      "id": "selic",
      "valor": 13.75,
      "variacao": 0,
      "variacaoPct": 0,
      "apuradoEm": "2026-10-30T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-10-30T12:00:00-03:00"
      },
      "serie": [
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75,
        13.75
      ],
      "estado": "mantido"
    },
    "ipca": {
      "id": "ipca",
      "valor": 4.58,
      "variacao": 0.3600000000000003,
      "variacaoPct": 8.530805687203799,
      "apuradoEm": "2026-09-01T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-09-01T12:00:00-03:00"
      },
      "serie": [
        4.24,
        4.42,
        4.76,
        4.87,
        4.83,
        4.56,
        5.06,
        5.48,
        5.53,
        5.32,
        5.35,
        5.23,
        5.13,
        5.17,
        4.68,
        4.46,
        4.26,
        4.44,
        3.81,
        4.14,
        4.39,
        4.72,
        4.64,
        4.44,
        4.22,
        4.58
      ],
      "estado": "mantido"
    },
    "dolar": {
      "id": "dolar",
      "valor": 5.4212,
      "variacao": 0.046800000000000175,
      "variacaoPct": 0.8707948794284046,
      "apuradoEm": "2026-10-30T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-10-30T12:00:00-03:00"
      },
      "serie": [
        5.1575,
        5.1117,
        5.1161,
        5.1414,
        5.1795,
        5.1991,
        5.2132,
        5.2204,
        5.1809,
        5.2079,
        5.2238,
        4.9859,
        4.9698,
        4.9935,
        5.0119,
        4.9892,
        5.0096,
        5.0441,
        5.0521,
        5.0826,
        5.0564,
        5.014,
        5.0277,
        5.0383,
        5.0377,
        5.5007,
        5.3346,
        5.342,
        5.3744,
        5.4212
      ],
      "estado": "novo"
    }
  }
};
