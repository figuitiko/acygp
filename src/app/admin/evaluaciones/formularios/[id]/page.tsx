import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";
import { notFound, redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { saveEvaluationMappingFromForm } from "@/features/evaluaciones/server/actions";
import { getEvaluationForm } from "@/features/evaluaciones/server/repository";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function EvaluationFormMappingPage({ params, searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/evaluaciones?auth=required");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const form = await getEvaluationForm(id);
  if (!form) notFound();

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <AdminNavigation currentPath="/admin/evaluaciones" />

        <Link href="/admin/evaluaciones" className="font-bold text-main underline">← Volver a evaluaciones</Link>
        <div className="rounded-2xl bg-main p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Mapeo de Google Form</p>
          <h1 className="mt-2 text-3xl font-bold">{form.googleFormTitle}</h1>
          <p className="mt-2 text-white/80">{form._count.submissions} entregas detectadas. Estado: {form.status}</p>
        </div>
        {query.error === "invalid-mapping" && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-800">Mapeo inválido: necesitás nombre, email y umbral válido.</p>}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-main">Configurar mapeo</h2>
          <form action={saveEvaluationMappingFromForm} className="mt-5 grid gap-4">
            <input type="hidden" name="formId" value={form.id} />
            <label className="text-sm font-semibold text-slate-700">Nombre de la evaluación / curso<input name="evaluationName" defaultValue={form.evaluationName ?? form.googleFormTitle} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <label className="text-sm font-semibold text-slate-700">Pregunta con nombre del participante<select name="participantNameQuestionId" defaultValue={form.participantNameQuestionId ?? ""} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Seleccionar</option>{form.questions.map((q) => <option key={q.id} value={q.googleItemId}>{q.title}</option>)}</select></label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="useRespondentEmail" defaultChecked={form.useRespondentEmail} /> Usar email recolectado por Google Forms</label>
            <label className="text-sm font-semibold text-slate-700">O pregunta con email del participante<select name="participantEmailQuestionId" defaultValue={form.participantEmailQuestionId ?? ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">No usar pregunta</option>{form.questions.map((q) => <option key={q.id} value={q.googleItemId}>{q.title}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Umbral de aprobación (%)<input name="passingThreshold" type="number" min="0" max="100" step="0.01" defaultValue={form.passingThreshold} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            <button className="rounded-lg bg-main px-4 py-3 font-bold text-white">Guardar mapeo y activar formulario</button>
          </form>
          <div className="mt-8">
            <h3 className="font-bold text-slate-900">Preguntas detectadas</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              {form.questions.map((q) => <li key={q.id} className="rounded-lg bg-slate-50 p-3"><strong>{q.title}</strong><br /><span>{q.googleItemId}</span></li>)}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
