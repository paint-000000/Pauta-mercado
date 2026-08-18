"use client";

import { getTermo } from "@/data/glossario";
import { useGlossario } from "./GlossarioProvider";

/**
 * Envolve um rótulo qualquer num gatilho de glossário.
 *
 * Serve para os casos em que o jargão não está dentro de uma frase e
 * portanto não passa pelo `<Texto>` — rótulo de tabela, cabeçalho de
 * indicador, legenda. "EV/EBITDA" numa coluna precisa ser explicável
 * exatamente como "duration" dentro de um parágrafo.
 */
export default function TermoChip({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { abrir } = useGlossario();
  const termo = getTermo(slug);

  if (!termo) {
    // Em produção a validação quebra o build antes disso. Aqui,
    // degrada para texto simples em vez de sumir com o rótulo.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[glossário] termo não encontrado: "${slug}"`);
    }
    return <>{children}</>;
  }

  return (
    <button
      type="button"
      className="termo"
      onClick={() => abrir(slug)}
      aria-label={`O que é ${termo.termo}?`}
    >
      {children}
    </button>
  );
}
