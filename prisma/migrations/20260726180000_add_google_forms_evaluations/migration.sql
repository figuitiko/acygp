-- CreateEnum
CREATE TYPE "EvaluationFormStatus" AS ENUM ('UNMAPPED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "EvaluationSubmissionWorkflow" AS ENUM ('AWAITING_MAPPING', 'PENDING_REVIEW', 'REVIEWED');

-- CreateEnum
CREATE TYPE "EvaluationOutcome" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "EvaluationScoreSource" AS ENUM ('GOOGLE', 'MANUAL');

-- CreateTable
CREATE TABLE "EvaluationForm" (
    "id" TEXT NOT NULL,
    "googleFormId" TEXT NOT NULL,
    "googleFormTitle" TEXT NOT NULL,
    "status" "EvaluationFormStatus" NOT NULL DEFAULT 'UNMAPPED',
    "evaluationName" TEXT,
    "participantNameQuestionId" TEXT,
    "participantEmailQuestionId" TEXT,
    "useRespondentEmail" BOOLEAN NOT NULL DEFAULT false,
    "passingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationQuestion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "googleItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "googleResponseId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "respondentEmail" TEXT,
    "participantName" TEXT,
    "participantEmail" TEXT,
    "importedScore" DOUBLE PRECISION,
    "importedMaxScore" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION,
    "finalMaxScore" DOUBLE PRECISION,
    "scoreSource" "EvaluationScoreSource",
    "workflowStatus" "EvaluationSubmissionWorkflow" NOT NULL DEFAULT 'AWAITING_MAPPING',
    "outcome" "EvaluationOutcome",
    "thresholdSnapshot" DOUBLE PRECISION,
    "reviewerNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT,
    "googleItemId" TEXT NOT NULL,
    "questionTitleSnapshot" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationForm_googleFormId_key" ON "EvaluationForm"("googleFormId");

-- CreateIndex
CREATE INDEX "EvaluationForm_status_idx" ON "EvaluationForm"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationQuestion_formId_googleItemId_key" ON "EvaluationQuestion"("formId", "googleItemId");

-- CreateIndex
CREATE INDEX "EvaluationQuestion_formId_idx" ON "EvaluationQuestion"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationSubmission_formId_googleResponseId_key" ON "EvaluationSubmission"("formId", "googleResponseId");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_workflowStatus_idx" ON "EvaluationSubmission"("workflowStatus");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_outcome_idx" ON "EvaluationSubmission"("outcome");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_submittedAt_idx" ON "EvaluationSubmission"("submittedAt");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_participantName_idx" ON "EvaluationSubmission"("participantName");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_participantEmail_idx" ON "EvaluationSubmission"("participantEmail");

-- CreateIndex
CREATE INDEX "EvaluationAnswer_submissionId_idx" ON "EvaluationAnswer"("submissionId");

-- CreateIndex
CREATE INDEX "EvaluationAnswer_googleItemId_idx" ON "EvaluationAnswer"("googleItemId");

-- AddForeignKey
ALTER TABLE "EvaluationQuestion" ADD CONSTRAINT "EvaluationQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "EvaluationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationSubmission" ADD CONSTRAINT "EvaluationSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "EvaluationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationAnswer" ADD CONSTRAINT "EvaluationAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "EvaluationSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationAnswer" ADD CONSTRAINT "EvaluationAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "EvaluationQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
