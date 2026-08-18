"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getTermo } from "@/data/glossario";

/**
 * O glossário é global de propósito.
 *
 * Um termo técnico pode aparecer em qualquer texto de qualquer página,
 * e abrir a explicação nunca pode tirar a pessoa de onde ela está —
 * ela parou no meio de uma frase e quer voltar para ela. Por isso é um
 * painel sobre a página atual, e não uma rota.
 *
 * No desktop vira painel centrado; no mobile, folha inferior. Mesmo
 * componente, dois comportamentos — ver `.folha` no globals.css.
 */

type Ctx = { abrir: (slug: string) => void };

const GlossarioCtx = createContext<Ctx | null>(null);

export function useGlossario(): Ctx {
  const ctx = useContext(GlossarioCtx);
  if (!ctx) throw new Error("useGlossario precisa estar dentro de <GlossarioProvider>");
  return ctx;
}

export default function GlossarioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);

  const fechar = useCallback(() => setSlug(null), []);

  // Esc fecha e o foco vai para o botão de fechar ao abrir. Sem isso,
  // quem navega por teclado fica preso atrás do painel.
  useEffect(() => {
    if (!slug) return;
    fecharRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [slug, fechar]);

  const termo = slug ? getTermo(slug) : undefined;

  return (
    <GlossarioCtx.Provider value={{ abrir: setSlug }}>
      {children}

      {termo && (
        <>
          <button
            className="fundo-overlay"
            onClick={fechar}
            aria-label="Fechar explicação"
            tabIndex={-1}
          />
          <div
            className="folha"
            role="dialog"
            aria-modal="true"
            aria-labelledby="termo-titulo"
          >
            <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
              Entenda
            </p>
            <h2
              id="termo-titulo"
              className="manchete manchete-md"
              style={{ marginBottom: "var(--e-3)" }}
            >
              {termo.termo}
            </h2>

            <div className="pilha">
              <p className="corpo">{termo.definicaoCurta}</p>

              {termo.exemplo && (
                <p
                  style={{
                    fontSize: "var(--t-base)",
                    color: "var(--c-texto-2)",
                    borderLeft: "2px solid var(--c-regra-media)",
                    paddingLeft: "var(--e-3)",
                  }}
                >
                  {termo.exemplo}
                </p>
              )}

              {termo.porQueImporta && (
                <div className="ia" style={{ padding: "var(--e-4)" }}>
                  <p className="ia-rotulo" style={{ marginBottom: "var(--e-2)" }}>
                    Por que isso importa
                  </p>
                  <p style={{ fontSize: "var(--t-base)" }}>
                    {termo.porQueImporta}
                  </p>
                </div>
              )}

              {termo.relacionados.length > 0 && (
                <div>
                  <p className="chapeu" style={{ marginBottom: "var(--e-2)" }}>
                    Ver também
                  </p>
                  <div className="linha" style={{ gap: "var(--e-2)" }}>
                    {termo.relacionados.map((r) => {
                      const rel = getTermo(r);
                      if (!rel) return null;
                      return (
                        <button
                          key={r}
                          type="button"
                          className="chip"
                          style={{ minHeight: 32, fontSize: "var(--t-sm)" }}
                          onClick={() => setSlug(r)}
                        >
                          {rel.termo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                ref={fecharRef}
                type="button"
                className="btn"
                data-v="solido"
                onClick={fechar}
              >
                Entendi
              </button>
            </div>
          </div>
        </>
      )}
    </GlossarioCtx.Provider>
  );
}
