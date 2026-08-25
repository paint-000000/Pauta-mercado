/**
 * Contas com data.
 *
 * Mora em `lib` e não junto do componente pela mesma razão de
 * `formato.ts`: é lógica pura, e lógica pura precisa ser testável
 * fora do React. Um `.tsx` não pode ser importado pelo runner do
 * Node — o arquivo é que estaria no lugar errado, não o teste.
 */

/**
 * Diferença em dias de CALENDÁRIO, não em múltiplos de 24 horas.
 *
 * Uma edição das 6h de ontem tem "1 dia" às 8h de hoje, ainda que
 * não tenham passado 24 horas. É assim que se conta dia em jornal, e
 * é o que o leitor espera ler.
 */
export function idadeEmDias(data: string, agora: Date): number {
  const meiaNoiteDa = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const [a, m, d] = data.split("-").map(Number);
  const edicao = new Date(a, m - 1, d).getTime();

  return Math.max(0, Math.round((meiaNoiteDa(agora) - edicao) / 86_400_000));
}
