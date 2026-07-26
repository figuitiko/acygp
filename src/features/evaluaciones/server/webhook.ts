import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const answerSchema = z.object({
  itemId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  answer: z.union([z.string(), z.array(z.string())]),
  score: z.number().finite().nullable().optional(),
  maxScore: z.number().finite().nullable().optional(),
});

export const googleFormsSubmissionPayloadSchema = z.object({
  form: z.object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1).optional().default("Formulario sin título"),
  }),
  response: z.object({
    id: z.string().trim().min(1),
    submittedAt: z.iso.datetime(),
    respondentEmail: z.email().nullable().optional(),
    score: z.number().finite().nullable().optional(),
    maxScore: z.number().finite().nullable().optional(),
  }),
  answers: z.array(answerSchema).min(1),
});

export type GoogleFormsSubmissionPayload = z.infer<typeof googleFormsSubmissionPayloadSchema>;

export function parseGoogleFormsSubmissionPayload(payload: unknown) {
  return googleFormsSubmissionPayloadSchema.parse(payload);
}

export function verifyGoogleFormsWebhookSecret({
  provided,
  expected,
}: {
  provided: string | null;
  expected: string | undefined;
}) {
  if (!expected) {
    throw new Error("GOOGLE_FORMS_WEBHOOK_SECRET is required");
  }

  if (!provided) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
