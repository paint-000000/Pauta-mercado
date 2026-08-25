import { indicadores, NA_FAIXA } from "@/data/indicadores";
import { RODADO_EM, STATUS_FONTES } from "@/data/gerado/aplicar";

/**
 * A tarja permanente, agora que o site tem dois tipos de dado.
 *
 * Ela dizia "cotações e análises são fictícias". Isso deixou de ser
 * verdade no dia em que Selic, IPCA e câmbio passaram a vir do Banco
 * Central — e uma tarja de honestidade que afirma algo falso é pior
 * que nenhuma: ela ensina o leitor a ignorar tarja.
 *
 * O texto passa a separar as duas coisas, que é o mesmo corte que o
 * produto faz em todo lugar: número apurado de um lado, redação e
 * empresa inventada do outro.
 *
 * Quando uma fonte cai, a tarja avisa. Não é detalhe de operação: o
 * leitor está vendo um número velho, e ele precisa saber disso antes
 * de usar o número, não depois.
 *
 * A lista do que é apurado é DERIVADA, não digitada. Uma tarja com a
 * lista escrita à mão envelhece na primeira vez que alguém liga uma
 * fonte nova e esquece de voltar aqui — e uma tarja de honestidade
 * desatualizada é pior que nenhuma, porque ensina a ignorar tarja.
 */
export function Tarja() {
  const caidas = STATUS_FONTES.filter((f) => !f.ok);
  const rodou = new Date(RODADO_EM);
  const jaRodou = rodou.getTime() > 0;

  const apurados = NA_FAIXA.map((id) => indicadores.find((i) => i.id === id))
    .filter((i) => i !== undefined)
    .filter((i) => i.natureza === "apurado")
    .map((i) => i.nome);

  const lista =
    apurados.length > 1
      ? `${apurados.slice(0, -1).join(", ")} e ${apurados[apurados.length - 1]}`
      : apurados[0];

  return (
    <p className="tarja" role="status">
      {caidas.length > 0 && (
        <>
          <strong>
            {caidas.map((f) => f.nome).join(" e ")}{" "}
            {caidas.length === 1 ? "não respondeu" : "não responderam"} na última
            atualização — esses números estão desatualizados.
          </strong>{" "}
        </>
      )}
      {apurados.length > 0 ? (
        <>
          <strong>{lista}</strong> {apurados.length === 1 ? "vem" : "vêm"} do
          Banco Central
          {jaRodou && (
            <>
              {" "}
              e {apurados.length === 1 ? "foi buscado" : "foram buscados"} em{" "}
              <time dateTime={RODADO_EM}>
                {/* pt-BR abrevia o mês com ponto ("20 de ago."); somado
                    ao ponto final da frase virava "ago..". */}
                {rodou
                  .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                  .replace(/\.$/, "")}
              </time>
            </>
          )}
          . Os demais números, as empresas e as análises são fictícios e vêm
          marcados com <span aria-hidden="true">~</span>
          <span className="so-leitor">um til</span>.
        </>
      ) : (
        <>Protótipo · cotações e análises são fictícias.</>
      )}
    </p>
  );
}
