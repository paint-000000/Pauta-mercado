import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="env">
      <div className="secao" style={{ marginTop: "var(--e-16)", maxWidth: "48ch" }}>
        <p className="chapeu" style={{ marginBottom: "var(--e-3)" }}>Erro 404</p>
        <h1 className="manchete manchete-lg">Esta página não existe</h1>
        <p className="linha-fina" style={{ marginTop: "var(--e-4)" }}>
          O endereço pode estar errado ou o conteúdo pode ter mudado de lugar.
        </p>
        <p style={{ marginTop: "var(--e-6)" }}>
          <Link href="/" className="btn" data-v="solido">
            Voltar para a capa
          </Link>
        </p>
      </div>
    </div>
  );
}
