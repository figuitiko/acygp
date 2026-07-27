import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";

import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { buildEvaluationDetailPath, buildIndividualEvaluationPdfPath } from "@/features/evaluaciones/domain/routes";
import {
  loginEvaluacionesAdmin,
  logoutEvaluacionesAdmin,
} from "@/features/evaluaciones/server/actions";
import {
  countEvaluationSubmissions,
  listEvaluationForms,
  listEvaluationSubmissionsPage,
} from "@/features/evaluaciones/server/repository";

export const metadata = { title: "Admin evaluaciones | ACyGP" };

type Props = {
  searchParams: Promise<{
    auth?: string;
    error?: string;
    mapped?: string;
    page?: string;
    q?: string;
    formId?: string;
    workflowStatus?: string;
    outcome?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function AdminEvaluacionesPage({ searchParams }: Props) {
  const [isAuthenticated, query] = await Promise.all([isAdminAuthenticated(), searchParams]);

  if (!isAuthenticated) {
    return <LoginPanel authState={query.auth} />;
  }

  const [forms, result, totalMatching] = await Promise.all([
    listEvaluationForms(),
    listEvaluationSubmissionsPage(query),
    countEvaluationSubmissions(query),
  ]);
  const unmappedForms = forms.filter((form) => form.status === "UNMAPPED");
  const pdfParams = new URLSearchParams();
  for (const key of ["q", "formId", "workflowStatus", "outcome", "from", "to"] as const) {
    if (query[key]) pdfParams.set(key, query[key]!);
  }

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <AdminNavigation currentPath="/admin/evaluaciones" />

        <div className="flex flex-col gap-4 rounded-2xl bg-main p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Panel interno</p>
            <h1 className="mt-2 text-3xl font-bold">Evaluaciones de conocimientos</h1>
            <p className="mt-2 max-w-3xl text-white/80">
              Revisá respuestas enviadas desde Google Forms, confirmá calificaciones y exportá PDFs. Esto NO es constancia ni certificado.
            </p>
          </div>
          <form action={logoutEvaluacionesAdmin}>
            <button className="rounded-full border border-white/50 px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-main">
              Cerrar sesión
            </button>
          </form>
        </div>

        {query.mapped && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
            Formulario mapeado correctamente. Las entregas pendientes pasaron a revisión.
          </p>
        )}

        {unmappedForms.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <h2 className="text-lg font-bold">Formularios pendientes de mapeo</h2>
            <p className="mt-1 text-sm">Hay entregas retenidas hasta definir nombre, email y umbral.</p>
            <div className="mt-4 flex flex-col gap-2">
              {unmappedForms.map((form) => (
                <Link key={form.id} href={`/admin/evaluaciones/formularios/${form.id}`} className="font-bold text-main underline">
                  Mapear {form.googleFormTitle} ({form._count.submissions} entregas)
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-5 shadow">
          <form className="grid gap-4 lg:grid-cols-6">
            <label className="lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Buscar</span>
              <input name="q" defaultValue={query.q ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre, email, evaluación..." />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Formulario</span>
              <select name="formId" defaultValue={query.formId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Todos</option>
                {forms.map((form) => <option key={form.id} value={form.id}>{form.evaluationName ?? form.googleFormTitle}</option>)}
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Estado</span>
              <select name="workflowStatus" defaultValue={query.workflowStatus ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Todos</option>
                <option value="AWAITING_MAPPING">Sin mapeo</option>
                <option value="PENDING_REVIEW">Por revisar</option>
                <option value="REVIEWED">Revisadas</option>
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Resultado</span>
              <select name="outcome" defaultValue={query.outcome ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Todos</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button className="rounded-lg bg-main px-4 py-2 font-bold text-white">Filtrar</button>
              <Link href="/admin/evaluaciones" className="rounded-lg border px-4 py-2 font-bold text-slate-600">Limpiar</Link>
            </div>
            <label>
              <span className="text-sm font-semibold text-slate-700">Desde</span>
              <input type="date" name="from" defaultValue={query.from ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700">Hasta</span>
              <input type="date" name="to" defaultValue={query.to ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
          </form>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{totalMatching} resultados. Cada entrega tiene su PDF individual. El resumen filtrado es solo tabla administrativa.</p>
            {totalMatching > 0 ? (
              <Link href={`/admin/evaluaciones/pdf?${pdfParams.toString()}`} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white">
                Descargar resumen filtrado
              </Link>
            ) : (
              <span className="rounded-lg bg-slate-200 px-4 py-2 font-bold text-slate-500">
                Sin resumen para descargar
              </span>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-2xl font-bold text-main">Entregas</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">Participante</th>
                  <th className="p-3">Evaluación</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((submission) => (
                  <tr key={submission.id} className="border-b">
                    <td className="p-3"><strong>{submission.participantName ?? "Sin mapear"}</strong><br /><span className="text-slate-500">{submission.participantEmail ?? submission.respondentEmail ?? "Sin email"}</span></td>
                    <td className="p-3">{submission.form.evaluationName ?? submission.form.googleFormTitle}</td>
                    <td className="p-3">{submission.workflowStatus}</td>
                    <td className="p-3">{submission.outcome ?? "Pendiente"}</td>
                    <td className="p-3">{formatDate(submission.submittedAt)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-3">
                        <Link className="font-bold text-main underline" href={buildEvaluationDetailPath(submission.id)}>Ver / revisar</Link>
                        <Link className="font-bold text-slate-900 underline" href={buildIndividualEvaluationPdfPath(submission.id)}>PDF individual</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {result.items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No hay evaluaciones con esos filtros.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination basePath="/admin/evaluaciones" query={query} pagination={result.pagination} />
        </section>
      </section>
    </main>
  );
}

function LoginPanel({ authState }: { authState?: string }) {
  return (
    <main className="flex min-h-[calc(100vh-220px)] items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-main/70">Acceso interno</p>
        <h1 className="mt-2 text-3xl font-bold text-main">Admin evaluaciones</h1>
        <p className="mt-3 text-slate-600">Ingresá la clave interna para revisar evaluaciones.</p>
        {authState === "invalid" && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Clave incorrecta.</p>}
        <form action={loginEvaluacionesAdmin} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Clave admin<input name="password" type="password" required className="rounded-lg border border-slate-300 px-4 py-3" /></label>
          <button className="rounded-lg bg-main px-4 py-3 font-bold text-white">Entrar</button>
        </form>
      </section>
    </main>
  );
}

function Pagination({ basePath, query, pagination }: { basePath: string; query: Record<string, string | undefined>; pagination: { page: number; totalPages: number; hasPreviousPage: boolean; hasNextPage: boolean } }) {
  const makeHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => { if (value && key !== "page") params.set(key, value); });
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };
  return <div className="mt-4 flex items-center justify-between text-sm"><span>Página {pagination.page} de {pagination.totalPages}</span><div className="flex gap-2">{pagination.hasPreviousPage && <Link className="rounded border px-3 py-1" href={makeHref(pagination.page - 1)}>Anterior</Link>}{pagination.hasNextPage && <Link className="rounded border px-3 py-1" href={makeHref(pagination.page + 1)}>Siguiente</Link>}</div></div>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "America/Mexico_City" }).format(date);
}
