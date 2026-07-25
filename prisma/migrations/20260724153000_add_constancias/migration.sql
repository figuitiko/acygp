-- CreateEnum
CREATE TYPE "ConstanciaStatus" AS ENUM ('VALID', 'REVOKED');

-- CreateTable
CREATE TABLE "Constancia" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "validationHash" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "standardCode" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "status" "ConstanciaStatus" NOT NULL DEFAULT 'VALID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Constancia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Constancia_folio_key" ON "Constancia"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Constancia_validationHash_key" ON "Constancia"("validationHash");

-- CreateIndex
CREATE INDEX "Constancia_status_idx" ON "Constancia"("status");

-- CreateIndex
CREATE INDEX "Constancia_issuedAt_idx" ON "Constancia"("issuedAt");
