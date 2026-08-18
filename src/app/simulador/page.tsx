"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RotuloSecao } from "@/components/ui/Dados";
import {
  CLASSES,
  simular,
  type Prazo,
  type TemReserva,
  type Tolerancia,
} from "@/lib/simulador";

/**
 * Simulador — "no que investir com R$ 2.000 hoje".
 *
 * Três perguntas, não um cadastro. Sem conta, sem login, nada sai do
 * navegador: as respostas vivem no estado do componente e somem
 * quando a aba fecha.
 *
 * O resultado sai do motor determinístico em `lib/simulador.ts`.
 * Nenhum modelo participa da decisão — a IA só redigiria os textos.
 */

const PRAZOS: { v: Prazo; r: string }[] = [
  { v: "ate1", r: "Até 1 ano" },
  { v: "1a3", r: "1 a 3 anos" },
  { v: "3a5", r: "3 a 5 anos" },
  { v: "mais5", r: "Mais de 5 anos" },
];

const TOLERANCIAS: { v: Tolerancia; r: string }[] = [
  { v: "seguranca", r: "Prefiro segurança" },
  { v: "alguma", r: "Aceito alguma oscilação" },
  { v: "bastante", r: "Aceito bastante" },
];

const RESERVAS: { v: TemReserva; r: string }[] = [
  { v: "sim", r: "Já tenho" },
  { v: "nao", r: "Ainda não" },
];

const ATALHOS = [500, 1000, 2000, 5000, 10000];

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Simulador() {
  const [valor, setValor] = useState(2000);
  const [prazo, setPrazo] = useState<Prazo>("mais5");
  const [tolerancia, setTolerancia] = useState<Tolerancia>("alguma");
  const [reserva, setReserva] = useState<TemReserva>("sim");

  const resultado = useMemo(
    () => simular({ valor, prazo, tolerancia, reserva }),
    [valor, prazo, tolerancia, reserva],
  );

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
          Três perguntas e uma sugestão de distribuição, com a razão de cada
          fatia. Sem cadastro — as respostas não saem do seu navegador.
        </p>
      </header>

      <div className="grade" style={{ marginTop: "var(--e-8)" }}>
        {/* ---------- Entradas ---------- */}
        <section className="col-5">
          <div className="painel">
            <div className="pilha" style={{ gap: "var(--e-6)" }}>
              <div className="sim-perg">
                <label htmlFor="valor">Quanto você tem</label>
                <div className="sim-valor">
                  <span
                    style={{ fontSize: "var(--t-lg)", color: "var(--c-texto-3)" }}
                  >
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

              <div className="sim-perg">
                <span id="lbl-prazo">Quando vai usar</span>
                <div className="sim-opcoes" role="group" aria-labelledby="lbl-prazo">
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
                </div>
              </div>

              <div className="sim-perg">
                <span id="lbl-osc">Oscilação</span>
                <div className="sim-opcoes" role="group" aria-labelledby="lbl-osc">
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
                </div>
              </div>

              <div className="sim-perg">
                <span id="lbl-res">Reserva de emergência</span>
                <div className="sim-opcoes" role="group" aria-labelledby="lbl-res">
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Resultado ---------- */}
        <section className="col-7">
          {/* A justificativa vem ANTES da distribuição: o leitor precisa
              saber de onde veio a sugestão antes de lê-la. */}
          <div className="ia">
            <p className="ia-rotulo">Por que esta distribuição</p>
            <p style={{ fontSize: "var(--t-md)", lineHeight: 1.55 }}>
              {resultado.justificativa}
            </p>

            <dl>
              <div className="ia-campo">
                <dt>O que mudaria isto</dt>
                <dd style={{ fontSize: "var(--t-sm)" }}>{resultado.invalidaria}</dd>
              </div>
            </dl>

            <div className="ia-nota">
              <span>Regra aplicada: {resultado.regra}</span>
              <span>Simulação educacional · não é recomendação</span>
            </div>
          </div>

          <div style={{ marginTop: "var(--e-6)" }}>
            <RotuloSecao>Distribuição sugerida</RotuloSecao>

            {/* Barra proporcional: a leitura de relance vem antes da lista */}
            <div className="sim-barra" aria-hidden="true">
              {resultado.fatias.map((f) => (
                <span
                  key={f.classe}
                  style={{
                    width: `${f.percentual}%`,
                    background: CLASSES[f.classe].cor,
                  }}
                />
              ))}
            </div>

            <div style={{ marginTop: "var(--e-2)" }}>
              {resultado.fatias.map((f) => {
                const c = CLASSES[f.classe];
                return (
                  <div key={f.classe} className="sim-fatia">
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
                          maxWidth: "52ch",
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
                          fontSize: "var(--t-xl)",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        R$ {brl(f.valor)}
                      </span>
                      <span
                        className="num"
                        style={{
                          fontSize: "var(--t-xs)",
                          color: "var(--c-texto-3)",
                        }}
                      >
                        {f.percentual}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p
              className="linha-fina"
              style={{
                fontSize: "var(--t-sm)",
                marginTop: "var(--e-5)",
                borderTop: "1px solid var(--c-regra)",
                paddingTop: "var(--e-4)",
              }}
            >
              São classes de ativo, não produtos de nenhuma instituição. As
              proporções ainda são provisórias e precisam de revisão por
              profissional habilitado antes de qualquer uso real. Este site não
              recebe comissão de ninguém.
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
