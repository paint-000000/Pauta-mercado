/* GERADO POR scripts/atualizar.ts — NÃO EDITE À MÃO.

   Este arquivo é o retrato do mercado na última rodada do robô. Ele
   é versionado de propósito: o histórico do git vira o histórico do
   que o site mostrou, e dá para responder "o que estava na tela no
   dia X" sem guardar banco nenhum. */
import type { Manifesto } from "@/lib/fontes/tipos";

export const MERCADO: Manifesto = {
  "rodadoEm": "2026-11-13T02:02:47.151Z",
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
      "apuradoEm": "2026-11-12T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-11-12T12:00:00-03:00"
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
      "valor": 4.63,
      "variacao": 0.04999999999999982,
      "variacaoPct": 1.091703056768555,
      "apuradoEm": "2026-10-01T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-10-01T12:00:00-03:00"
      },
      "serie": [
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
        4.58,
        4.63
      ],
      "estado": "novo"
    },
    "dolar": {
      "id": "dolar",
      "valor": 5.6143,
      "variacao": 0.05370000000000008,
      "variacaoPct": 0.9657231234039507,
      "apuradoEm": "2026-11-12T12:00:00-03:00",
      "fonte": {
        "nome": "Banco Central",
        "url": "https://www.bcb.gov.br",
        "publicadoEm": "2026-11-12T12:00:00-03:00"
      },
      "serie": [
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
        5.4212,
        5.4935,
        5.4778,
        5.4621,
        5.5013,
        5.5146,
        5.584,
        5.5606,
        5.6143
      ],
      "estado": "novo"
    }
  }
};
