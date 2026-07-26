export function buildEvaluationDetailPath(submissionId: string) {
  return `/admin/evaluaciones/${encodeURIComponent(submissionId)}`;
}

export function buildIndividualEvaluationPdfPath(submissionId: string) {
  return `${buildEvaluationDetailPath(submissionId)}/pdf`;
}
