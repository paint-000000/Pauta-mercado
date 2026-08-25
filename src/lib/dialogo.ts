"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * COMPORTAMENTO DE DIÁLOGO — busca e glossário
 *
 * Os dois painéis do site abrem por cima da página e cobrem o que
 * estava sendo lido. Isso impõe quatro obrigações que nenhum dos dois
 * cumpria por inteiro, e que são o mesmo código nos dois lugares:
 *
 * 1. **Esc fecha.** Já existia.
 * 2. **O foco entra no painel.** Sem isso, quem navega por teclado
 *    continua no fim da página, atrás do overlay, sem nada visível
 *    respondendo ao Tab.
 * 3. **O foco não escapa enquanto está aberto.** Tab no último
 *    elemento voltava para a página de baixo, que o leitor de tela
 *    anuncia mas o mouse não alcança.
 * 4. **O foco volta para onde estava.** Quem abriu o glossário no meio
 *    de um parágrafo precisa voltar para aquele parágrafo — é a
 *    promessa que o painel faz ao não ser uma rota.
 *
 * A rolagem do fundo trava junto: no mobile, a folha inferior rolava a
 * página de trás quando o dedo passava da borda.
 *
 * Não usei `<dialog>` nativo porque o painel do glossário troca de
 * conteúdo sem fechar (ao seguir "ver também") e a animação de folha
 * inferior depende do posicionamento próprio do `.folha`.
 */

const FOCAVEIS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useDialogo(
  aberto: boolean,
  fechar: () => void,
): RefObject<HTMLDivElement | null> {
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const anterior = document.activeElement as HTMLElement | null;
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focaveis = () =>
      Array.from(
        painel.current?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    // Só move o foco se ele ainda não estiver dentro do painel: o
    // glossário troca de termo sem fechar, e roubar o foco a cada
    // troca tiraria a pessoa do lugar onde ela acabou de clicar.
    //
    // Por padrão o foco vai para o próprio painel, e não para o
    // primeiro botão dentro dele: o leitor de tela anuncia o título do
    // diálogo em vez de um "CDI" solto. Quem tem um destino melhor —
    // a busca quer o cursor no campo — marca com `data-foco-inicial`.
    if (!painel.current?.contains(document.activeElement)) {
      const preferido =
        painel.current?.querySelector<HTMLElement>("[data-foco-inicial]");
      (preferido ?? painel.current)?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fechar();
        return;
      }

      if (e.key !== "Tab") return;

      const lista = focaveis();
      if (lista.length === 0) return;

      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      const atual = document.activeElement;

      if (e.shiftKey && (atual === primeiro || !painel.current?.contains(atual))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && atual === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = rolagem;
      // `isConnected` evita puxar o foco para um elemento que saiu da
      // árvore enquanto o painel estava aberto.
      if (anterior?.isConnected) anterior.focus();
    };
  }, [aberto, fechar]);

  return painel;
}
