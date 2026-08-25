import { idadeEmDias } from "@/lib/datas";

/**
 * Quantos dias a edição tem.
 *
 * A edição é redação: alguém escreveu aquilo num dia sobre aquele
 * dia. Os números dentro dela agora são vivos — `{{selic}}` busca o
 * valor de hoje. As duas coisas juntas criam um híbrido que precisa
 * ser declarado: uma manchete de 18 de agosto exibindo a Selic de
 * 20 não é mentira, mas também não é óbvio, e o leitor merece saber
 * qual metade é de quando.
 *
 * Jornal impresso resolve isso com a data no alto e ponto — porque
 * ali nada muda depois de impresso. Aqui muda, então a data sozinha
 * não basta.
 *
 * Some no mesmo dia: "hoje · há 0 dias" é ruído.
 */
export function IdadeDaEdicao({ data, agora = new Date() }: { data: string; agora?: Date }) {
  const dias = idadeEmDias(data, agora);
  if (dias < 1) return null;

  return (
    <span className="edicao-idade">
      {dias === 1 ? "de ontem" : `de ${dias} dias atrás`} · números atualizados
    </span>
  );
}
