"use client";

import { useSyncExternalStore } from "react";
import type { Interesse } from "@/types";

/**
 * PREFERÊNCIAS LOCAIS — sem conta, sem servidor.
 *
 * Os temas escolhidos vivem no `localStorage` e nunca saem do
 * navegador. Este arquivo existe para que a leitura seja feita num
 * lugar só, com três garantias que a página não tinha quando lia o
 * storage direto:
 *
 * 1. **Hidratação.** O snapshot do servidor é sempre a lista vazia, e
 *    o React troca pelo valor real depois de hidratar. Ler o storage
 *    durante o render produziria HTML diferente no servidor.
 *
 * 2. **Dado corrompido não derruba a página.** O que está gravado veio
 *    de uma versão anterior do site, de outra aba ou de alguém
 *    editando o storage à mão — não é confiável. Um `JSON.parse` solto
 *    devolvia qualquer coisa como `Interesse[]`, e um tema inválido
 *    quebrava a página inteira ao indexar os mapas de filtro. Aqui
 *    tudo passa por `sanearInteresses`.
 *
 * 3. **Duas abas continuam de acordo.** O evento `storage` invalida o
 *    snapshot, então mudar os temas numa aba atualiza a outra.
 */

const CHAVE = "pauta:interesses:v1";

/** Fonte da verdade dos valores aceitos. Nada fora daqui é gravado. */
const VALIDOS: readonly Interesse[] = [
  "renda-fixa",
  "acoes",
  "fiis",
  "exterior",
  "cripto",
  "ipos",
];

/**
 * Referência estável para "nada escolhido".
 *
 * `useSyncExternalStore` compara snapshots por identidade: devolver
 * um `[]` novo a cada chamada colocaria o React em loop de render.
 */
const VAZIO: Interesse[] = [];

const ouvintes = new Set<() => void>();

let cacheBruto: string | null = null;
let cacheValor: Interesse[] = VAZIO;

/**
 * Exportada para teste: é a defesa contra o que está gravado no disco,
 * e defesa sem teste é comentário.
 */
export function sanearInteresses(bruto: string | null): Interesse[] {
  if (!bruto) return VAZIO;
  try {
    const lido: unknown = JSON.parse(bruto);
    if (!Array.isArray(lido)) return VAZIO;
    const limpo = VALIDOS.filter((v) => lido.includes(v));
    return limpo.length > 0 ? limpo : VAZIO;
  } catch {
    return VAZIO;
  }
}

function lerBruto(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    // Storage bloqueado (modo privado, política do navegador).
    // Seguir sem persistência é melhor que quebrar a página.
    return null;
  }
}

function notificar() {
  for (const fn of ouvintes) fn();
}

function assinar(fn: () => void): () => void {
  ouvintes.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    ouvintes.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

/** Snapshot do cliente. Só recalcula quando o texto gravado muda. */
function snapshot(): Interesse[] {
  const bruto = lerBruto();
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    cacheValor = sanearInteresses(bruto);
  }
  return cacheValor;
}

/** Snapshot do servidor: ninguém tem preferência antes de hidratar. */
function snapshotServidor(): Interesse[] {
  return VAZIO;
}

export function alternarInteresse(v: Interesse): void {
  const atual = snapshot();
  const novo = atual.includes(v)
    ? atual.filter((x) => x !== v)
    : VALIDOS.filter((x) => x === v || atual.includes(x));

  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    // Sem persistência, a sessão ainda funciona: o cache abaixo
    // mantém a escolha válida enquanto a página estiver aberta.
  }

  cacheBruto = JSON.stringify(novo);
  cacheValor = novo.length > 0 ? novo : VAZIO;
  notificar();
}

export function useInteresses(): Interesse[] {
  return useSyncExternalStore(assinar, snapshot, snapshotServidor);
}

/**
 * `false` no servidor e no primeiro render do cliente, `true` depois.
 *
 * Serve para segurar rótulos que dependem do storage — mostrar
 * "nenhum tema escolhido" antes de ler o disco seria uma informação
 * errada por um frame.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    assinar,
    () => true,
    () => false,
  );
}

export const INTERESSES = VALIDOS;
