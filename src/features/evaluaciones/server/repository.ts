import {
  EvaluationFormStatus,
  EvaluationOutcome as PrismaEvaluationOutcome,
  EvaluationScoreSource,
  EvaluationSubmissionWorkflow,
} from "@/generated/prisma/enums";
import type { EvaluationSubmissionWhereInput } from "@/generated/prisma/models/EvaluationSubmission";
import { createPagination } from "@/features/constancias/domain/pagination";

import {
  calculateEvaluationOutcome,
  normalizeEvaluationSearchTerm,
  requireValidMapping,
} from "../domain/evaluation";
import type { GoogleFormsSubmissionPayload } from "./webhook";
import { prisma } from "@/features/constancias/server/db";

export const EVALUATIONS_PAGE_SIZE = 10;
export const BATCH_PDF_LIMIT = 500;

export type EvaluationFilters = {
  page?: string | number | null;
  q?: string | null;
  formId?: string | null;
  workflowStatus?: string | null;
  outcome?: string | null;
  from?: string | null;
  to?: string | null;
};

export async function ingestGoogleFormsSubmission(payload: GoogleFormsSubmissionPayload) {
  return prisma.$transaction(async (tx) => {
    const form = await tx.evaluationForm.upsert({
      where: { googleFormId: payload.form.id },
      create: {
        googleFormId: payload.form.id,
        googleFormTitle: payload.form.title,
        status: EvaluationFormStatus.UNMAPPED,
      },
      update: { googleFormTitle: payload.form.title },
    });

    const questionByGoogleId = new Map<string, string>();
    for (const answer of payload.answers) {
      const question = await tx.evaluationQuestion.upsert({
        where: {
          formId_googleItemId: {
            formId: form.id,
            googleItemId: answer.itemId,
          },
        },
        create: {
          formId: form.id,
          googleItemId: answer.itemId,
          title: answer.title,
        },
        update: { title: answer.title },
      });
      questionByGoogleId.set(answer.itemId, question.id);
    }

    const existing = await tx.evaluationSubmission.findUnique({
      where: {
        formId_googleResponseId: {
          formId: form.id,
          googleResponseId: payload.response.id,
        },
      },
      include: { form: true, answers: true },
    });

    if (existing) {
      return { submission: existing, created: false };
    }

    const extracted = extractParticipantFields(form, payload);
    const workflowStatus =
      form.status === EvaluationFormStatus.ACTIVE
        ? EvaluationSubmissionWorkflow.PENDING_REVIEW
        : EvaluationSubmissionWorkflow.AWAITING_MAPPING;

    const submission = await tx.evaluationSubmission.create({
      data: {
        formId: form.id,
        googleResponseId: payload.response.id,
        submittedAt: new Date(payload.response.submittedAt),
        respondentEmail: payload.response.respondentEmail ?? null,
        participantName: extracted.participantName,
        participantEmail: extracted.participantEmail,
        importedScore: payload.response.score ?? null,
        importedMaxScore: payload.response.maxScore ?? null,
        finalScore: null,
        finalMaxScore: null,
        scoreSource: payload.response.score !== null && payload.response.score !== undefined ? EvaluationScoreSource.GOOGLE : null,
        workflowStatus,
        answers: {
          create: payload.answers.map((answer) => ({
            questionId: questionByGoogleId.get(answer.itemId) ?? null,
            googleItemId: answer.itemId,
            questionTitleSnapshot: answer.title,
            answer: serializeAnswer(answer.answer),
            score: answer.score ?? null,
            maxScore: answer.maxScore ?? null,
          })),
        },
      },
      include: { form: true, answers: true },
    });

    return { submission, created: true };
  });
}

export async function listEvaluationForms() {
  return prisma.evaluationForm.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { submissions: true } } },
  });
}

export async function getEvaluationForm(id: string) {
  return prisma.evaluationForm.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
      _count: { select: { submissions: true } },
    },
  });
}

export async function saveEvaluationFormMapping(input: {
  formId: string;
  evaluationName: string;
  participantNameQuestionId: string;
  participantEmailQuestionId: string | null;
  useRespondentEmail: boolean;
  passingThreshold: number;
}) {
  requireValidMapping(input);

  return prisma.$transaction(async (tx) => {
    const form = await tx.evaluationForm.update({
      where: { id: input.formId },
      data: {
        status: EvaluationFormStatus.ACTIVE,
        evaluationName: input.evaluationName.trim(),
        participantNameQuestionId: input.participantNameQuestionId,
        participantEmailQuestionId: input.participantEmailQuestionId,
        useRespondentEmail: input.useRespondentEmail,
        passingThreshold: input.passingThreshold,
      },
      include: { submissions: { include: { answers: true } } },
    });

    for (const submission of form.submissions.filter(
      (item) => item.workflowStatus === EvaluationSubmissionWorkflow.AWAITING_MAPPING
    )) {
      const extracted = extractParticipantFields(form, {
        response: { respondentEmail: submission.respondentEmail },
        answers: submission.answers.map((answer) => ({
          itemId: answer.googleItemId,
          answer: answer.answer,
        })),
      });

      await tx.evaluationSubmission.update({
        where: { id: submission.id },
        data: {
          participantName: extracted.participantName,
          participantEmail: extracted.participantEmail,
          workflowStatus: EvaluationSubmissionWorkflow.PENDING_REVIEW,
        },
      });
    }

    return form;
  });
}

export async function listEvaluationSubmissionsPage(filters: EvaluationFilters = {}) {
  const where = createEvaluationWhere(filters);
  const totalItems = await prisma.evaluationSubmission.count({ where });
  const pagination = createPagination({ page: filters.page, pageSize: EVALUATIONS_PAGE_SIZE, totalItems });
  const items = await prisma.evaluationSubmission.findMany({
    where,
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    skip: pagination.offset,
    take: pagination.pageSize,
    include: { form: true },
  });

  return { items, pagination };
}

export async function countEvaluationSubmissions(filters: EvaluationFilters = {}) {
  return prisma.evaluationSubmission.count({ where: createEvaluationWhere(filters) });
}

export async function listEvaluationSubmissionsForPdf(filters: EvaluationFilters = {}) {
  const where = createEvaluationWhere(filters);
  const total = await prisma.evaluationSubmission.count({ where });

  if (total > BATCH_PDF_LIMIT) {
    throw new Error(`batch-pdf-limit:${total}`);
  }

  return prisma.evaluationSubmission.findMany({
    where,
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    include: { form: true },
    take: BATCH_PDF_LIMIT,
  });
}

export async function getEvaluationSubmission(id: string) {
  return prisma.evaluationSubmission.findUnique({
    where: { id },
    include: {
      form: true,
      answers: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function reviewEvaluationSubmission(input: {
  id: string;
  finalScore: number;
  finalMaxScore: number;
  reviewerNotes: string | null;
}) {
  const submission = await prisma.evaluationSubmission.findUniqueOrThrow({
    where: { id: input.id },
    include: { form: true },
  });
  const outcome = calculateEvaluationOutcome({
    score: input.finalScore,
    maxScore: input.finalMaxScore,
    passingThreshold: submission.form.passingThreshold,
  });

  return prisma.evaluationSubmission.update({
    where: { id: input.id },
    data: {
      finalScore: input.finalScore,
      finalMaxScore: input.finalMaxScore,
      scoreSource: EvaluationScoreSource.MANUAL,
      workflowStatus: EvaluationSubmissionWorkflow.REVIEWED,
      outcome: outcome === "PASS" ? PrismaEvaluationOutcome.PASS : PrismaEvaluationOutcome.FAIL,
      thresholdSnapshot: submission.form.passingThreshold,
      reviewerNotes: input.reviewerNotes,
      reviewedAt: new Date(),
    },
  });
}

function extractParticipantFields(
  form: {
    participantNameQuestionId: string | null;
    participantEmailQuestionId: string | null;
    useRespondentEmail: boolean;
  },
  payload: {
    response: { respondentEmail?: string | null };
    answers: Array<{ itemId: string; answer: string | string[] }>;
  }
) {
  const answers = new Map(payload.answers.map((answer) => [answer.itemId, serializeAnswer(answer.answer)]));
  const participantName = form.participantNameQuestionId
    ? answers.get(form.participantNameQuestionId)?.trim() || null
    : null;
  const participantEmail = form.useRespondentEmail
    ? payload.response.respondentEmail?.trim() || null
    : form.participantEmailQuestionId
      ? answers.get(form.participantEmailQuestionId)?.trim() || null
      : null;

  return { participantName, participantEmail };
}

function serializeAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(", ") : answer;
}

function createEvaluationWhere(filters: EvaluationFilters): EvaluationSubmissionWhereInput | undefined {
  const clauses: EvaluationSubmissionWhereInput[] = [];
  const search = normalizeEvaluationSearchTerm(filters.q);

  if (search) {
    clauses.push({
      OR: [
        { participantName: { contains: search, mode: "insensitive" } },
        { participantEmail: { contains: search, mode: "insensitive" } },
        { respondentEmail: { contains: search, mode: "insensitive" } },
        { googleResponseId: { contains: search, mode: "insensitive" } },
        { form: { evaluationName: { contains: search, mode: "insensitive" } } },
        { form: { googleFormTitle: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.formId) clauses.push({ formId: filters.formId });
  if (isWorkflow(filters.workflowStatus)) clauses.push({ workflowStatus: filters.workflowStatus });
  if (isOutcome(filters.outcome)) clauses.push({ outcome: filters.outcome });

  const submittedAt: { gte?: Date; lte?: Date } = {};
  if (filters.from) submittedAt.gte = new Date(`${filters.from}T00:00:00.000Z`);
  if (filters.to) submittedAt.lte = new Date(`${filters.to}T23:59:59.999Z`);
  if (submittedAt.gte || submittedAt.lte) clauses.push({ submittedAt });

  if (clauses.length === 0) return undefined;
  return { AND: clauses };
}

function isWorkflow(value?: string | null): value is EvaluationSubmissionWorkflow {
  return Boolean(value && Object.values(EvaluationSubmissionWorkflow).includes(value as EvaluationSubmissionWorkflow));
}

function isOutcome(value?: string | null): value is PrismaEvaluationOutcome {
  return Boolean(value && Object.values(PrismaEvaluationOutcome).includes(value as PrismaEvaluationOutcome));
}
