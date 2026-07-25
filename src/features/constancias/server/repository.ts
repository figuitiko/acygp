import { ConstanciaStatus } from "@/generated/prisma/enums";
import type { ConstanciaWhereInput } from "@/generated/prisma/models/Constancia";

import {
  buildConstanciaValidationUrl,
  createConstanciaHash,
  createConstanciaPayload,
  formatConstanciaFolio,
} from "../domain/constancia";
import { createPagination } from "../domain/pagination";
import { normalizeConstanciasSearchTerm } from "../domain/search";
import { prisma } from "./db";

export type ConstanciaFormInput = {
  recipientName: string;
  courseName: string;
  standardCode?: string | null;
  issuedAt: Date;
};

export type CreateConstanciaInput = ConstanciaFormInput & {
  siteUrl: string;
};

export type UpdateConstanciaInput = ConstanciaFormInput & {
  id: string;
};

const CONSTANCIAS_PAGE_SIZE = 10;

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

export async function listConstanciasPage({
  page,
  search,
}: {
  page?: string | number | null;
  search?: string | null;
} = {}) {
  const where = createConstanciasSearchWhere(search);
  const totalItems = await prisma.constancia.count({ where });
  const pagination = createPagination({
    page,
    pageSize: CONSTANCIAS_PAGE_SIZE,
    totalItems,
  });

  const items = await prisma.constancia.findMany({
    where,
    orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
    skip: pagination.offset,
    take: pagination.pageSize,
  });

  return {
    items,
    pagination,
  };
}

export async function listConstancias() {
  return listConstanciasPage().then((result) => result.items);
}

function createConstanciasSearchWhere(search?: string | null): ConstanciaWhereInput | undefined {
  const normalizedSearch = normalizeConstanciasSearchTerm(search);

  if (!normalizedSearch) {
    return undefined;
  }

  return {
    OR: [
      { folio: { contains: normalizedSearch, mode: "insensitive" } },
      { recipientName: { contains: normalizedSearch, mode: "insensitive" } },
      { courseName: { contains: normalizedSearch, mode: "insensitive" } },
      { standardCode: { contains: normalizedSearch, mode: "insensitive" } },
    ],
  };
}

export async function updateConstancia(input: UpdateConstanciaInput) {
  const current = await prisma.constancia.findUniqueOrThrow({
    where: { id: input.id },
    select: { folio: true },
  });
  const payload = createConstanciaPayload({
    folio: current.folio,
    recipientName: input.recipientName,
    courseName: input.courseName,
    standardCode: input.standardCode,
    issuedAt: input.issuedAt,
  });
  const validationHash = createConstanciaHash({
    payload,
    secret: getValidationSecret(),
  });

  return prisma.constancia.update({
    where: { id: input.id },
    data: {
      validationHash,
      recipientName: payload.recipientName,
      courseName: payload.courseName,
      standardCode: payload.standardCode,
      issuedAt: input.issuedAt,
    },
  });
}

export async function revokeConstancia(id: string) {
  return updateConstanciaStatus(id, ConstanciaStatus.REVOKED);
}

export async function reactivateConstancia(id: string) {
  return updateConstanciaStatus(id, ConstanciaStatus.VALID);
}

function updateConstanciaStatus(id: string, status: ConstanciaStatus) {
  return prisma.constancia.update({
    where: { id },
    data: { status },
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
