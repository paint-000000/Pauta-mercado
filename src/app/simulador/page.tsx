"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RotuloSecao } from "@/components/ui/Dados";
import {
  CLASSES,
  simular,
  type ClasseSim,
  type Prazo,
  type TemReserva,
  type Tolerancia,
} from "@/lib/simulador";
import {
  oportunidadesDaClasse,
  ROTULO_RISCO_OP,
} from "@/data/oportunidades";

/**
 * Simulador.
 *
 * Três perguntas, não um cadastro. Sem conta, sem login: as respostas
 * vivem no estado do componente e somem quando a aba fecha.
 *
 * O resultado sai do motor determinístico em `lib/simulador.ts`.
 * Nenhum modelo participa da decisão.
 *
 * Cada fatia abre a lista de instrumentos concretos daquela classe.
 * Terminar em "título atrelado à inflação" deixa a pessoa exatamente
 * onde ela começou — sabendo a categoria e sem saber o que existe
 * dentro dela.
 */

const PRAZOS: { v: Prazo; r: string }[] = [
  { v: "ate1", r: "Até 1 ano" },
  { v: "1a3", r: "1 a 3 anos" },
  { v: "3a5", r: "3 a 5 anos" },
  { v: "mais5", r: "Mais de 5 anos" },
];

const TOLERANCIAS: { v: Tolerancia; r: string }[] = [
  { v: "seguranca", r: "Prefiro segurança" },
  { v: "alguma", r: "Aceito alguma" },
  { v: "bastante", r: "Aceito bastante" },
];

const RESERVAS: { v: TemReserva; r: string }[] = [
  { v: "sim", r: "Já tenho" },
  { v: "nao", r: "Ainda não" },
];

const ATALHOS = [500, 1000, 2000, 5000, 10000];

const brl = (n: number, casas = 0) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

export default function Simulador() {
  const [valor, setValor] = useState(2000);
  const [prazo, setPrazo] = useState<Prazo>("mais5");
  const [tolerancia, setTolerancia] = useState<Tolerancia>("alguma");
  const [reserva, setReserva] = useState<TemReserva>("sim");
  // `null` = ninguém escolheu ainda (abre a primeira); "none" = o
  // usuário fechou explicitamente. Sem esse terceiro estado, fechar um
  // bloco cairia de volta no padrão e abriria outro sozinho.
  const [aberta, setAberta] = useState<ClasseSim | "none" | null>(null);

  const r = useMemo(
    () => simular({ valor, prazo, tolerancia, reserva }),
    [valor, prazo, tolerancia, reserva],
  );

  // A primeira fatia abre por padrão: é a que mais importa, e evita que
  // a lista de oportunidades pareça não existir.
  const primeira = r.fatias[0]?.classe ?? null;
  const expandida =
    aberta === null ? primeira : aberta === "none" ? null : aberta;

  return (
    <div className="env">
      <header className="secao" style={{ marginTop: "var(--e-8)" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>
          <strong>Simulador</strong>
        </p>
        <h1 className="manchete manchete-lg" style={{ maxWidth: "22ch" }}>
          No que investir com R$ {brl(valor)} hoje
        </h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          Quatro perguntas, uma distribuição sugerida e os instrumentos
          concretos de cada classe. Sem cadastro — nada sai do seu navegador.
        </p>
      </header>

      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        {/* ---------------- Entradas ---------------- */}
        <section className="col-4">
          <div
            className="painel"
            style={{ position: "sticky", top: "var(--e-4)" }}
          >
            <div className="pilha" style={{ gap: "var(--e-6)" }}>
              <div className="sim-perg">
                <label htmlFor="valor">Quanto você tem</label>
                <div className="sim-valor">
                  <span style={{ fontSize: "var(--t-lg)", color: "var(--c-texto-3)" }}>
                    R$
                  </span>
                  <input
                    id="valor"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={100}
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="sim-opcoes" style={{ marginTop: "var(--e-3)" }}>
                  {ATALHOS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className="chip"
                      aria-pressed={valor === a}
                      onClick={() => setValor(a)}
                    >
                      {brl(a)}
                    </button>
                  ))}
                </div>
              </div>

              <Pergunta rotulo="Quando vai usar" id="prazo">
                {PRAZOS.map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    className="chip"
                    aria-pressed={prazo === p.v}
                    onClick={() => setPrazo(p.v)}
                  >
                    {p.r}
                  </button>
                ))}
              </Pergunta>

              <Pergunta rotulo="Oscilação" id="osc">
                {TOLERANCIAS.map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    className="chip"
                    aria-pressed={tolerancia === t.v}
                    onClick={() => setTolerancia(t.v)}
                  >
                    {t.r}
                  </button>
                ))}
              </Pergunta>

              <Pergunta rotulo="Reserva de emergência" id="res">
                {RESERVAS.map((x) => (
                  <button
                    key={x.v}
                    type="button"
                    className="chip"
                    aria-pressed={reserva === x.v}
                    onClick={() => setReserva(x.v)}
                  >
                    {x.r}
                  </button>
                ))}
              </Pergunta>
            </div>
          </div>
        </section>

        {/* ---------------- Resultado ---------------- */}
        <section className="col-8">
          {/* A justificativa vem ANTES da distribuição: é preciso saber
              de onde veio a sugestão antes de lê-la. */}
          <div className="ia">
            <p className="ia-rotulo">Por que esta distribuição</p>
            <p style={{ fontSize: "var(--t-md)", lineHeight: 1.55 }}>
              {r.justificativa}
            </p>
            <dl>
              <div className="ia-campo">
                <dt>O que mudaria isto</dt>
                <dd style={{ fontSize: "var(--t-sm)" }}>{r.invalidaria}</dd>
              </div>
            </dl>
            <div className="ia-nota">
              <span>Regra aplicada: {r.regra}</span>
              <span>Simulação educacional · não é recomendação</span>
            </div>
          </div>

          {/* Resumo: três números que a soma das fatias não entrega */}
          <div style={{ marginTop: "var(--e-6)" }}>
            <RotuloSecao>Como fica a carteira</RotuloSecao>
            <dl className="resumo-tira">
              <div className="resumo-cel">
                <dt>Acessível em 2 dias</dt>
                <dd>{r.resumo.liquidoRapido}%</dd>
              </div>
              <div className="resumo-cel">
                <dt>Segue a inflação</dt>
                <dd>{r.resumo.protegidoInflacao}%</dd>
              </div>
              <div className="resumo-cel">
                <dt>Renda variável</dt>
                <dd>{r.resumo.emRendaVariavel}%</dd>
              </div>
              <div className="resumo-cel">
                <dt>Risco geral</dt>
                <dd style={{ fontSize: "var(--t-lg)", textTransform: "capitalize" }}>
                  {ROTULO_RISCO_OP[r.resumo.riscoPonderado]}
                </dd>
              </div>
            </dl>
          </div>

          {/* Distribuição */}
          <div style={{ marginTop: "var(--e-6)" }}>
            <RotuloSecao>Distribuição sugerida</RotuloSecao>

            <div className="sim-barra" aria-hidden="true">
              {r.fatias.map((f) => (
                <span
                  key={f.classe}
                  style={{
                    width: `${f.percentual}%`,
                    background: CLASSES[f.classe].cor,
                  }}
                />
              ))}
            </div>

            <div style={{ marginTop: "var(--e-3)" }}>
              {r.fatias.map((f) => {
                const c = CLASSES[f.classe];
                // A reserva tem horizonte próprio: ordenar os títulos
                // dela pelo prazo da carteira poria o vencimento mais
                // longo em primeiro, que é o oposto do que serve.
                const ops = oportunidadesDaClasse(
                  f.classe,
                  f.valor,
                  c.horizonteNatural ?? r.horizonteAnos,
                );
                const abertoAqui = expandida === f.classe;
                const cabem = ops.filter((o) => o.cabe).length;

                return (
                  <div
                    key={f.classe}
                    style={{
                      borderBottom: "1px solid var(--c-regra)",
                      paddingBottom: "var(--e-5)",
                      marginBottom: "var(--e-5)",
                    }}
                  >
                    <div className="sim-fatia" style={{ borderBottom: 0, paddingBottom: 0 }}>
                      <span
                        className="sim-marca"
                        style={{ background: c.cor }}
                        aria-hidden="true"
                      />

                      <div>
                        <h3 className="manchete manchete-sm">
                          {c.ticker ? (
                            <Link href={`/ativo/${c.ticker}`}>{c.nome}</Link>
                          ) : (
                            c.nome
                          )}
                        </h3>
                        <p
                          style={{
                            fontSize: "var(--t-sm)",
                            color: "var(--c-texto-2)",
                            marginTop: "var(--e-2)",
                            maxWidth: "54ch",
                          }}
                        >
                          {f.porque}
                        </p>
                        <p className="artigo-meta">
                          <span>Risco {c.risco}</span>
                          <span>Liquidez {c.liquidez}</span>
                        </p>
                      </div>

                      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <span
                          className="num"
                          style={{
                            display: "block",
                            fontSize: "var(--t-2xl)",
                            letterSpacing: "-0.035em",
                            lineHeight: 1.1,
                          }}
                        >
                          R$ {brl(f.valor)}
                        </span>
                        <span
                          className="num"
                          style={{ fontSize: "var(--t-xs)", color: "var(--c-texto-3)" }}
                        >
                          {f.percentual}% do total
                        </span>
                      </div>
                    </div>

                    {/* As oportunidades concretas da classe */}
                    {ops.length > 0 && (
                      <div className="op-bloco">
                        <button
                          type="button"
                          className="op-cabeca"
                          aria-expanded={abertoAqui}
                          onClick={() => setAberta(abertoAqui ? "none" : f.classe)}
                        >
                          <span>
                            {ops.length}{" "}
                            {ops.length === 1 ? "opção nesta classe" : "opções nesta classe"}
                            {cabem < ops.length &&
                              ` · ${cabem} cabe${cabem === 1 ? "" : "m"} nos R$ ${brl(f.valor)}`}
                          </span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {abertoAqui && (
                          <div className="op-lista">
                            {ops.map(({ item, cabe }) => (
                              <div
                                key={item.id}
                                className="op-item"
                                data-cabe={cabe ? "sim" : "nao"}
                              >
                                <div>
                                  <span className="op-nome">
                                    {item.ticker ? (
                                      <Link href={`/ativo/${item.ticker}`}>
                                        {item.nome}
                                      </Link>
                                    ) : (
                                      item.nome
                                    )}
                                  </span>
                                  <span className="op-emissor">{item.emissor}</span>
                                </div>

                                <div className="op-num">
                                  <strong>{item.indicador}</strong>
                                  <span>{item.indicadorRotulo}</span>
                                </div>

                                <div className="op-corpo">
                                  <p className="op-meta">
                                    <span>Mín. R$ {brl(item.minimo, 2)}</span>
                                    {item.vencimento && (
                                      <span>Vence {item.vencimento}</span>
                                    )}
                                    <span>{item.liquidez}</span>
                                    <span>Risco {ROTULO_RISCO_OP[item.risco]}</span>
                                  </p>

                                  <p className="op-destaque">{item.destaque}</p>
                                  <p className="op-obs">{item.observacao}</p>

                                  {!cabe && (
                                    <p
                                      className="op-meta"
                                      style={{ color: "var(--c-texto-2)" }}
                                    >
                                      Acima dos R$ {brl(f.valor)} desta fatia — apareceria
                                      com um valor maior
                                    </p>
                                  )}

                                  <p className="op-meta">
                                    Fonte: {item.fontes.map((x) => x.nome).join(" · ")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p
              className="linha-fina"
              style={{ fontSize: "var(--t-sm)", paddingTop: "var(--e-2)" }}
            >
              As proporções são provisórias e precisam de revisão por
              profissional habilitado antes de qualquer uso real. As taxas
              exibidas são de protótipo. Este site não recebe comissão de
              ninguém e não intermedeia nenhuma compra.
            </p>
          </div>
        </section>
      </div>

      <section className="secao">
        <RotuloSecao href="/dicas">Antes de decidir</RotuloSecao>
        <p className="linha-fina" style={{ fontSize: "var(--t-base)" }}>
          A ordem que este simulador usa vem das dicas: reserva primeiro, prazo
          antes de perfil, e uma razão para cada escolha.{" "}
          <Link href="/dicas" style={{ textDecoration: "underline" }}>
            Ver todas as dicas
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function Pergunta({
  rotulo,
  id,
  children,
}: {
  rotulo: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sim-perg">
      <span id={`lbl-${id}`}>{rotulo}</span>
      <div className="sim-opcoes" role="group" aria-labelledby={`lbl-${id}`}>
        {children}
      </div>
    </div>
  );
}
