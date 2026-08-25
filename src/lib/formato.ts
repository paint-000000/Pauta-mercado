/**
 * Formatação de número em pt-BR.
 *
 * Mora em `lib` e não junto do componente porque não é coisa de
 * componente: a validação de conteúdo e a interpolação de valor
 * precisam dela e rodam fora do React. Enquanto estava num `.tsx`,
 * importá-la de um script quebrava o runner do Node, que não entende
 * JSX — o arquivo é que estava no lugar errado, não o import.
 */
export function formatar(
  valor: number,
  casas: number,
  prefixo?: string,
  sufixo?: string,
): string {
  const n = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
  return `${prefixo ?? ""}${n}${sufixo ?? ""}`;
}
