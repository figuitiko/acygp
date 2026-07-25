import type { Metadata } from "next";
import Link from "next/link";

import { getConstanciaByFolio, isRevoked } from "@/features/constancias/server/repository";

export const metadata: Metadata = {
  title: "Validar constancia | ACyGP",
  description: "Validación pública de constancias emitidas por ACyGP.",
};

type ValidateConstanciaPageProps = {
  params: Promise<{ folio: string }>;
};

export default async function ValidateConstanciaPage({ params }: ValidateConstanciaPageProps) {
  const { folio } = await params;
  const constancia = await getConstanciaByFolio(decodeURIComponent(folio));

  if (!constancia) {
    return (
      <ValidationShell tone="missing" title="Constancia no encontrada">
        <p>
          No encontramos una constancia ACyGP con el folio consultado. Verificá que el QR o el folio estén completos.
        </p>
        <Disclaimer />
      </ValidationShell>
    );
  }

  if (isRevoked(constancia.status)) {
    return (
      <ValidationShell tone="revoked" title="Constancia revocada">
        <ConstanciaSummary constancia={constancia} />
        <p className="mt-4 font-semibold text-red-700">
          Esta constancia fue revocada por ACyGP y no debe considerarse vigente.
        </p>
        <Disclaimer />
      </ValidationShell>
    );
  }

  return (
    <ValidationShell tone="valid" title="Constancia válida">
      <ConstanciaSummary constancia={constancia} />
      <p className="mt-4 font-semibold text-emerald-700">
        El folio y hash de esta constancia existen en el registro interno de ACyGP.
      </p>
      <Disclaimer />
    </ValidationShell>
  );
}

type ValidationShellProps = {
  tone: "valid" | "revoked" | "missing";
  title: string;
  children: React.ReactNode;
};

function ValidationShell({ tone, title, children }: ValidationShellProps) {
  const toneClasses = {
    valid: "border-emerald-200 bg-emerald-50 text-emerald-800",
    revoked: "border-red-200 bg-red-50 text-red-800",
    missing: "border-amber-200 bg-amber-50 text-amber-800",
  }[tone];

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-main/70">Validación pública</p>
        <div className={`mt-6 rounded-2xl border px-5 py-4 ${toneClasses}`}>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="mt-8 text-slate-700">{children}</div>
        <Link href="/" className="mt-8 inline-flex font-bold text-main hover:underline">
          Volver al sitio ACyGP
        </Link>
      </section>
    </main>
  );
}

type PublicConstancia = NonNullable<Awaited<ReturnType<typeof getConstanciaByFolio>>>;

function ConstanciaSummary({ constancia }: { constancia: PublicConstancia }) {
  return (
    <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
      <SummaryItem label="Folio" value={constancia.folio} />
      <SummaryItem label="Nombre" value={constancia.recipientName} />
      <SummaryItem label="Curso o estándar" value={constancia.courseName} />
      <SummaryItem label="Código" value={constancia.standardCode ?? "No aplica"} />
      <SummaryItem label="Fecha de emisión" value={formatDate(constancia.issuedAt)} />
      <SummaryItem label="Estado" value={constancia.status === "VALID" ? "Válida" : "Revocada"} />
    </dl>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
      Esta validación confirma únicamente constancias emitidas por ACyGP. No sustituye la consulta oficial de certificados CONOCER en RENAP.
    </p>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}
