"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "@/features/constancias/server/admin-auth";
import { parseOptionalScore } from "../domain/evaluation";
import { reviewEvaluationSubmission, saveEvaluationFormMapping } from "./repository";

const mappingSchema = z.object({
  formId: z.string().min(1),
  evaluationName: z.string().trim().min(1),
  participantNameQuestionId: z.string().trim().min(1),
  participantEmailQuestionId: z.string().trim().optional(),
  useRespondentEmail: z.boolean(),
  passingThreshold: z.number().min(0).max(100),
});

export async function loginEvaluacionesAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminPassword(password)) {
    redirect("/admin/evaluaciones?auth=invalid");
  }

  await setAdminSessionCookie();
  redirect("/admin/evaluaciones");
}

export async function logoutEvaluacionesAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin/evaluaciones");
}

export async function saveEvaluationMappingFromForm(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/evaluaciones?auth=required");
  }

  const formId = String(formData.get("formId") ?? "");
  const result = mappingSchema.safeParse({
    formId,
    evaluationName: formData.get("evaluationName"),
    participantNameQuestionId: formData.get("participantNameQuestionId"),
    participantEmailQuestionId: formData.get("participantEmailQuestionId"),
    useRespondentEmail: formData.get("useRespondentEmail") === "on",
    passingThreshold: Number(formData.get("passingThreshold")),
  });

  if (!result.success) {
    redirect(`/admin/evaluaciones/formularios/${encodeURIComponent(formId || "missing")}?error=invalid-mapping`);
  }

  try {
    await saveEvaluationFormMapping({
      ...result.data,
      participantEmailQuestionId: result.data.participantEmailQuestionId || null,
    });
  } catch {
    redirect(`/admin/evaluaciones/formularios/${encodeURIComponent(formId)}?error=invalid-mapping`);
  }

  revalidatePath("/admin/evaluaciones");
  redirect(`/admin/evaluaciones?mapped=${encodeURIComponent(formId)}`);
}

export async function reviewEvaluationFromForm(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/evaluaciones?auth=required");
  }

  const id = String(formData.get("id") ?? "");

  try {
    const finalScore = parseOptionalScore(formData.get("finalScore"));
    const finalMaxScore = parseOptionalScore(formData.get("finalMaxScore"));

    if (finalScore === null || finalMaxScore === null) {
      throw new Error("final score and max score are required");
    }

    await reviewEvaluationSubmission({
      id,
      finalScore,
      finalMaxScore,
      reviewerNotes: String(formData.get("reviewerNotes") ?? "").trim() || null,
    });
  } catch {
    redirect(`/admin/evaluaciones/${encodeURIComponent(id || "missing")}?error=invalid-review`);
  }

  revalidatePath("/admin/evaluaciones");
  redirect(`/admin/evaluaciones/${encodeURIComponent(id)}?reviewed=1`);
}
