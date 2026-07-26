export type EvaluationOutcome = "PASS" | "FAIL";

export type EvaluationMappingInput = {
  participantNameQuestionId: string | null;
  participantEmailQuestionId: string | null;
  useRespondentEmail: boolean;
  evaluationName: string;
  passingThreshold: number;
};

export function calculateEvaluationOutcome({
  score,
  maxScore,
  passingThreshold,
}: {
  score: number;
  maxScore: number;
  passingThreshold: number;
}): EvaluationOutcome {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || !Number.isFinite(passingThreshold)) {
    throw new Error("Score, max score, and passing threshold must be valid numbers");
  }

  if (score < 0 || maxScore <= 0 || score > maxScore) {
    throw new Error("Score must be between zero and max score");
  }

  if (passingThreshold < 0 || passingThreshold > 100) {
    throw new Error("Passing threshold must be between 0 and 100");
  }

  return (score / maxScore) * 100 >= passingThreshold ? "PASS" : "FAIL";
}

export function requireValidMapping(input: EvaluationMappingInput) {
  if (!input.participantNameQuestionId?.trim()) {
    throw new Error("participant name mapping is required");
  }

  if (!input.participantEmailQuestionId?.trim() && !input.useRespondentEmail) {
    throw new Error("email mapping is required");
  }

  if (!input.evaluationName.trim()) {
    throw new Error("evaluation name is required");
  }

  if (!Number.isFinite(input.passingThreshold) || input.passingThreshold < 0 || input.passingThreshold > 100) {
    throw new Error("passing threshold must be between 0 and 100");
  }
}

export function parseOptionalScore(value: FormDataEntryValue | string | null) {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    throw new Error("score must be a valid number");
  }

  return parsed;
}

export function normalizeEvaluationSearchTerm(search?: string | null) {
  const normalized = search?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function formatPercentage(value: number) {
  return `${value.toLocaleString("es-MX", { maximumFractionDigits: 2 })}%`;
}

export function formatScore(score: number | null, maxScore: number | null) {
  if (score === null || maxScore === null) {
    return "Sin calificación";
  }

  return `${score.toLocaleString("es-MX", { maximumFractionDigits: 2 })} / ${maxScore.toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;
}
