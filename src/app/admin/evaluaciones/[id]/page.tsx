import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { formatScore } from "@/features/evaluaciones/domain/evaluation";
import { buildIndividualEvaluationPdfPath } from "@/features/evaluaciones/domain/routes";
import { reviewEvaluationFromForm } from "@/features/evaluaciones/server/actions";
import { getEvaluationSubmission } from "@/features/evaluaciones/server/repository";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; reviewed?: string }> };

export default async function EvaluationDetailPage({ params, searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/evaluaciones?auth=required");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const submission = await getEvaluationSubmission(id);
  if (!submission) notFound();

  const defaultScore = submission.finalScore ?? submission.importedScore ?? "";
  const defaultMaxScore = submission.finalMaxScore ?? submission.importedMaxScore ?? "";

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/admin/evaluaciones" className="font-bold text-main underline">← Volver a evaluaciones</Link>
        <div className="rounded-2xl bg-main p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Revisión interna</p>
          <h1 className="mt-2 text-3xl font-bold">{submission.participantName ?? "Participante sin mapear"}</h1>
          <p className="mt-2 text-white/80">{submission.form.evaluationName ?? submission.form.googleFormTitle}</p>
        </div>
        {query.error === "invalid-review" && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-800">Revisá la calificación final y máxima.</p>}
        {query.reviewed && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">Evaluación revisada correctamente.</p>}

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-main">Respuestas</h2>
            <dl className="mt-4 grid gap-2 text-sm">
              <Info label="Email" value={submission.participantEmail ?? submission.respondentEmail ?? "Sin email"} />
              <Info label="Enviado" value={formatDate(submission.submittedAt)} />
              <Info label="Score importado" value={formatScore(submission.importedScore, submission.importedMaxScore)} />
              <Info label="Estado" value={submission.workflowStatus} />
              <Info label="Resultado" value={submission.outcome ?? "Pendiente"} />
            </dl>
            <div className="mt-6 flex flex-col gap-4">
              {submission.answers.map((answer) => (
                <div key={answer.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-900">{answer.questionTitleSnapshot}</p>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">{answer.answer || "Sin respuesta"}</p>
                  {(answer.score !== null || answer.maxScore !== null) && <p className="mt-2 text-sm text-slate-500">Score Google: {formatScore(answer.score, answer.maxScore)}</p>}
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-main">Confirmar resultado</h2>
            {submission.workflowStatus === "AWAITING_MAPPING" ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                Este formulario todavía no está mapeado. Primero configurá nombre/email/umbral.
                <br />
                <Link className="font-bold text-main underline" href={`/admin/evaluaciones/formularios/${submission.form.id}`}>Mapear formulario</Link>
              </div>
            ) : (
              <form action={reviewEvaluationFromForm} className="mt-4 flex flex-col gap-4">
                <input type="hidden" name="id" value={submission.id} />
                <label className="text-sm font-semibold text-slate-700">Score final<input name="finalScore" type="number" step="0.01" min="0" required defaultValue={defaultScore} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <label className="text-sm font-semibold text-slate-700">Score máximo<input name="finalMaxScore" type="number" step="0.01" min="0.01" required defaultValue={defaultMaxScore} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <p className="rounded-lg bg-blue-50 p-3 text-sm text-main">Umbral actual: <strong>{submission.form.passingThreshold}%</strong>. Al revisar se guarda una copia histórica de este umbral.</p>
                <label className="text-sm font-semibold text-slate-700">Notas del revisor<textarea name="reviewerNotes" defaultValue={submission.reviewerNotes ?? ""} rows={5} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
                <button className="rounded-lg bg-main px-4 py-3 font-bold text-white">Guardar revisión</button>
              </form>
            )}
            <Link href={buildIndividualEvaluationPdfPath(submission.id)} className="mt-4 block rounded-lg bg-slate-900 px-4 py-3 text-center font-bold text-white">Descargar PDF individual</Link>
            <p className="mt-4 text-xs font-semibold text-amber-700">Resultado de evaluación de conocimientos. No es constancia ni certificado.</p>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[140px_1fr] gap-3"><dt className="font-bold text-main">{label}</dt><dd>{value}</dd></div>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Mexico_City" }).format(date);
}
