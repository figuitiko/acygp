import type { PrismaClient } from "@/generated/prisma/client";

const REQUIRED_PRISMA_MODEL_DELEGATES = [
  "constancia",
  "evaluationForm",
  "evaluationQuestion",
  "evaluationSubmission",
  "evaluationAnswer",
] as const;

export function canReusePrismaClient(client: unknown): client is PrismaClient {
  if (!client || typeof client !== "object") {
    return false;
  }

  return REQUIRED_PRISMA_MODEL_DELEGATES.every((delegate) => delegate in client);
}
