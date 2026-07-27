"use client";

import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";

export default function AdminEvaluacionesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <AdminNavigation currentPath="/admin/evaluaciones" />
        <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">No pudimos cargar evaluaciones</p>
          <h1 className="mt-2 text-3xl font-bold text-main">Intentá de nuevo</h1>
          <p className="mt-3 text-slate-600">
            Las respuestas de evaluación no se cargaron correctamente. Podés reintentar o revisar constancias mientras tanto.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={reset} className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
              Reintentar
            </button>
            <Link href="/admin/constancias" className="rounded-lg border border-slate-300 px-5 py-3 font-bold text-main transition hover:bg-slate-50">
              Ir a constancias
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
