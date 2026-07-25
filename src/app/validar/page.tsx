import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { buildConstanciaValidationPath } from "@/features/constancias/domain/constancia";

export const metadata: Metadata = {
  title: "Validar constancia | ACyGP",
  description: "Consulta pública para validar constancias emitidas por ACyGP.",
};

type ValidatePageProps = {
  searchParams: Promise<{ folio?: string }>;
};

export default async function ValidatePage({ searchParams }: ValidatePageProps) {
  const { folio } = await searchParams;

  if (folio?.trim()) {
    redirect(buildConstanciaValidationPath(folio));
  }

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-main/70">Validación pública</p>
        <h1 className="mt-2 text-3xl font-bold text-main">Validar constancia ACyGP</h1>
        <p className="mt-3 text-slate-600">
          Ingresá el folio que aparece en tu constancia o escaneá el QR del documento para confirmar si fue emitida por ACyGP y si está vigente.
        </p>

        <form method="get" action="/validar" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="folio">Folio de constancia</label>
          <input
            id="folio"
            name="folio"
            placeholder="ACyGP-2026-000001"
            required
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-main focus:ring-2 focus:ring-main/20"
          />
          <button className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
            Validar
          </button>
        </form>

        <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          Esta validación confirma únicamente constancias emitidas por ACyGP. No sustituye la consulta oficial de certificados CONOCER en RENAP.
        </p>
      </section>
    </main>
  );
}
