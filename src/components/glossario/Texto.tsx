"use client";

import { Fragment } from "react";
import { getTermo } from "@/data/glossario";
import { PADRAO_VALOR, resolverValor } from "@/lib/interpolar";
import { useGlossario } from "./GlossarioProvider";

/**
 * Renderiza texto com marcação de glossário.
 *
 *   "A [[selic]] subiu"          → usa o nome do termo
 *   "A [[selic|taxa básica]]"    → usa o texto depois da barra
 *   "A Selic está em {{selic}}"  → valor atual, buscado no render
 *   "{{ibovespa.var}}"           → variação, com sinal
 *
 * As duas marcações são resolvidas na mesma passagem. `[[]]` explica
 * uma palavra; `{{}}` impede que um número envelheça dentro da
 * frase — ver `lib/interpolar.ts` para por que isso foi preciso.
 *
 * Escolhi marcação no conteúdo, e não detecção automática por
 * dicionário, por dois motivos: quem escreve decide onde a explicação
 * ajuda (marcar "ação" toda vez que a palavra aparece vira ruído), e
 * um `[[termo]]` órfão é detectável — a validação da Fase 5 falha o
 * build em vez de publicar um chip que não abre nada.
 */

const PADRAO = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export default function Texto({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const { abrir } = useGlossario();
  const partes: React.ReactNode[] = [];

  let ultimo = 0;
  let m: RegExpExecArray | null;

  // `exec` com /g mantém estado no regex; recriar por chamada evita
  // que renders concorrentes compartilhem lastIndex.
  // Uma passagem só, alternando entre as duas marcações. Duas
  // passagens encadeadas quebrariam se um valor caísse dentro do
  // rótulo de um termo.
  const re = new RegExp(`${PADRAO.source}|${PADRAO_VALOR.source}`, "gi");

  while ((m = re.exec(children)) !== null) {
    const [bruto, slug, rotulo, idValor, campoValor] = m;

    if (m.index > ultimo) {
      partes.push(children.slice(ultimo, m.index));
    }

    // Ramo do valor vivo: {{selic}} / {{ibovespa.var}}
    if (idValor) {
      const v = resolverValor(idValor.toLowerCase(), campoValor);

      if (!v) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[valor] indicador não encontrado: "${idValor}"`);
        }
        partes.push(bruto);
      } else {
        partes.push(
          <span
            key={`v-${idValor}-${m.index}`}
            className="valor-vivo"
            data-apurado={v.apurado ? "sim" : "nao"}
            title={
              v.apurado
                ? "Valor apurado, atualizado diariamente"
                : "Valor de protótipo — ainda não vem de fonte real"
            }
          >
            {v.conteudo}
          </span>,
        );
      }

      ultimo = m.index + bruto.length;
      continue;
    }

    const termo = getTermo(slug);

    if (!termo) {
      // Em produção isto não deve existir — a validação quebra o build
      // antes. Aqui, degrada para texto simples em vez de sumir.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[glossário] termo não encontrado: "${slug}"`);
      }
      partes.push(rotulo ?? slug);
    } else {
      partes.push(
        <button
          key={`${slug}-${m.index}`}
          type="button"
          className="termo"
          onClick={() => abrir(slug)}
          aria-label={`O que é ${termo.termo}?`}
        >
          {rotulo ?? termo.termo}
        </button>,
      );
    }

    ultimo = m.index + bruto.length;
  }

  if (ultimo < children.length) {
    partes.push(children.slice(ultimo));
  }

  return (
    <span className={className}>
      {partes.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </span>
  );
}
