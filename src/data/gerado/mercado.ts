/* GERADO POR scripts/atualizar.ts — NÃO EDITE À MÃO.

   Este arquivo é o retrato do mercado na última rodada do robô. Ele
   é versionado de propósito: o histórico do git vira o histórico do
   que o site mostrou, e dá para responder "o que estava na tela no
   dia X" sem guardar banco nenhum. */
import type { Manifesto } from "@/lib/fontes/tipos";

export const MERCADO: Manifesto = {
  "rodadoEm": "2026-09-18T23:29:50.862Z",
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
      "apuradoEm": "2026-09-18T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-09-18T12:00:00-03:00"
      },
      "serie": [
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        14,
        13.75,
        13.75
      ],
      "estado": "mantido"
    },
    "ipca": {
      "id": "ipca",
      "valor": 4.22,
      "variacao": -0.22000000000000064,
      "variacaoPct": -4.954954954954969,
      "apuradoEm": "2026-08-01T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-08-01T12:00:00-03:00"
      },
      "serie": [
        4.5,
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
        4.22
      ],
      "estado": "mantido"
    },
    "dolar": {
      "id": "dolar",
      "valor": 5.1575,
      "variacao": 0.005399999999999849,
      "variacaoPct": 0.10481163020903805,
      "apuradoEm": "2026-09-18T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-09-18T12:00:00-03:00"
      },
      "serie": [
        5.0908,
        5.0963,
        5.1285,
        5.1639,
        5.1859,
        5.2236,
        5.2014,
        5.2043,
        5.1714,
        5.1862,
        5.1625,
        5.1512,
        5.149,
        5.1604,
        5.1642,
        5.2005,
        5.1816,
        5.157,
        5.1273,
        5.0962,
        5.1253,
        5.0856,
        5.0979,
        5.1149,
        5.0918,
        5.1696,
        5.149,
        5.1527,
        5.1521,
        5.1575
      ],
      "estado": "novo"
    }
  }
};
