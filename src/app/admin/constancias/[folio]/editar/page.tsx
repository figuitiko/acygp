import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";
import { redirect } from "next/navigation";

import { updateConstanciaFromForm } from "@/features/constancias/server/actions";
import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { getConstanciaByFolio } from "@/features/constancias/server/repository";

type EditConstanciaPageProps = {
  params: Promise<{ folio: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const metadata = {
  title: "Editar constancia | ACyGP",
};

export default async function EditConstanciaPage({ params, searchParams }: EditConstanciaPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/constancias?auth=required");
  }

  const [{ folio }, query] = await Promise.all([params, searchParams]);
  const decodedFolio = decodeURIComponent(folio);
  const constancia = await getConstanciaByFolio(decodedFolio);

  if (!constancia) {
    return (
      <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-main">Constancia no encontrada</h1>
          <p className="mt-3 text-slate-600">No existe una constancia con el folio {decodedFolio}.</p>
          <Link href="/admin/constancias" className="mt-6 inline-flex font-bold text-main hover:underline">
            Volver al admin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-2xl flex-col gap-6">
        <AdminNavigation currentPath="/admin/constancias" />

        <div className="rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-main/70">Panel interno</p>
        <h1 className="mt-2 text-3xl font-bold text-main">Editar constancia</h1>
        <p className="mt-2 text-slate-600">
          Folio {constancia.folio}. Al editar datos del documento se regenera el hash de validación.
        </p>

        {query.error === "invalid-data" && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-800">
            Datos inválidos. Revisá nombre, curso y fecha.
          </p>
        )}

        <form action={updateConstanciaFromForm} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="id" value={constancia.id} />
          <input type="hidden" name="folio" value={constancia.folio} />
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Nombre de la persona
            <input name="recipientName" required defaultValue={constancia.recipientName} className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Curso o estándar
            <input name="courseName" required defaultValue={constancia.courseName} className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Código de estándar, si aplica
            <input name="standardCode" defaultValue={constancia.standardCode ?? ""} className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Fecha de emisión
            <input name="issuedAt" type="date" required defaultValue={toDateInputValue(constancia.issuedAt)} className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
              Guardar cambios
            </button>
            <Link href="/admin/constancias" className="rounded-lg border border-slate-300 px-5 py-3 font-bold text-main transition hover:bg-slate-50">
              Cancelar
            </Link>
          </div>
        </form>
        </div>
      </section>
    </main>
  );
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}
