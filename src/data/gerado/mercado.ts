/* GERADO POR scripts/atualizar.ts — NÃO EDITE À MÃO.

   Este arquivo é o retrato do mercado na última rodada do robô. Ele
   é versionado de propósito: o histórico do git vira o histórico do
   que o site mostrou, e dá para responder "o que estava na tela no
   dia X" sem guardar banco nenhum. */
import type { Manifesto } from "@/lib/fontes/tipos";

export const MERCADO: Manifesto = {
  "rodadoEm": "2026-08-25T21:53:58.983Z",
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
      "valor": 14,
      "variacao": 0,
      "variacaoPct": 0,
      "apuradoEm": "2026-08-25T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-08-25T12:00:00-03:00"
      },
      "serie": [
        14.25,
        14.25,
        14.25,
        14.25,
        14.25,
        14.25,
        14.25,
        14.25,
        14.25,
        14.25,
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
        14
      ],
      "estado": "mantido"
    },
    "ipca": {
      "id": "ipca",
      "valor": 4.44,
      "variacao": -0.1999999999999993,
      "variacaoPct": -4.310344827586192,
      "apuradoEm": "2026-07-01T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-07-01T12:00:00-03:00"
      },
      "serie": [
        4.23,
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
        4.44
      ],
      "estado": "mantido"
    },
    "dolar": {
      "id": "dolar",
      "valor": 5.149,
      "variacao": -0.002200000000000202,
      "variacaoPct": -0.042708495107939934,
      "apuradoEm": "2026-08-25T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-08-25T12:00:00-03:00"
      },
      "serie": [
        5.0727,
        5.0975,
        5.1176,
        5.0894,
        5.078,
        5.0638,
        5.0807,
        5.0666,
        5.1005,
        5.1177,
        5.1217,
        5.0739,
        5.0773,
        5.0723,
        5.1053,
        5.1154,
        5.1017,
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
        5.149
      ],
      "estado": "novo"
    }
  }
};
