import { ConstanciaStatus } from "@/generated/prisma/enums";

import {
  buildConstanciaValidationUrl,
  createConstanciaHash,
  createConstanciaPayload,
  formatConstanciaFolio,
} from "../domain/constancia";
import { prisma } from "./db";

export type CreateConstanciaInput = {
  recipientName: string;
  courseName: string;
  standardCode?: string | null;
  issuedAt: Date;
  siteUrl: string;
};

export async function createConstancia(input: CreateConstanciaInput) {
  const year = input.issuedAt.getUTCFullYear();
  const folio = await createNextFolio(year);
  const payload = createConstanciaPayload({ ...input, folio });
  const validationHash = createConstanciaHash({
    payload,
    secret: getValidationSecret(),
  });

  const constancia = await prisma.constancia.create({
    data: {
      folio,
      validationHash,
      recipientName: payload.recipientName,
      courseName: payload.courseName,
      standardCode: payload.standardCode,
      issuedAt: input.issuedAt,
    },
  });

  return {
    ...constancia,
    validationUrl: buildConstanciaValidationUrl({ baseUrl: input.siteUrl, folio }),
  };
}

export async function getConstanciaByFolio(folio: string) {
  return prisma.constancia.findUnique({ where: { folio } });
}

export async function listConstancias() {
  return prisma.constancia.findMany({
    orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function revokeConstancia(id: string) {
  return prisma.constancia.update({
    where: { id },
    data: { status: ConstanciaStatus.REVOKED },
  });
}

export function isRevoked(status: ConstanciaStatus) {
  return status === ConstanciaStatus.REVOKED;
}

async function createNextFolio(year: number) {
  const prefix = `ACyGP-${year}-`;
  const latest = await prisma.constancia.findFirst({
    where: { folio: { startsWith: prefix } },
    orderBy: { folio: "desc" },
    select: { folio: true },
  });

  const latestSequence = latest ? Number(latest.folio.split("-").at(-1)) : 0;

  return formatConstanciaFolio(year, latestSequence + 1);
}

function getValidationSecret() {
  const secret = process.env.VALIDATION_SECRET ?? process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("VALIDATION_SECRET or ADMIN_PASSWORD is required to create constancia hashes");
  }

  return secret;
}
