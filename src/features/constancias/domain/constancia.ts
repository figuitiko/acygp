import { createHmac } from "node:crypto";

export type ConstanciaPayloadInput = {
  folio: string;
  recipientName: string;
  courseName: string;
  standardCode?: string | null;
  issuedAt: Date;
};

export type ConstanciaPayload = {
  folio: string;
  recipientName: string;
  courseName: string;
  standardCode: string | null;
  issuedAt: string;
};

export function formatConstanciaFolio(year: number, sequence: number) {
  if (!Number.isInteger(year) || year < 2000) {
    throw new Error("Constancia folio year must be a valid year");
  }

  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Constancia folio sequence must be a positive integer");
  }

  return `ACyGP-${year}-${sequence.toString().padStart(6, "0")}`;
}

export function createConstanciaPayload(input: ConstanciaPayloadInput): ConstanciaPayload {
  return {
    folio: input.folio.trim(),
    recipientName: normalizeText(input.recipientName),
    courseName: normalizeText(input.courseName),
    standardCode: input.standardCode ? normalizeText(input.standardCode) : null,
    issuedAt: input.issuedAt.toISOString().slice(0, 10),
  };
}

export function createConstanciaHash({
  payload,
  secret,
}: {
  payload: ConstanciaPayload;
  secret: string;
}) {
  if (!secret) {
    throw new Error("VALIDATION_SECRET is required to create constancia hashes");
  }

  const canonical = JSON.stringify(payload);

  return createHmac("sha256", secret).update(canonical).digest("hex");
}

export function buildConstanciaValidationUrl({
  baseUrl,
  folio,
}: {
  baseUrl: string;
  folio: string;
}) {
  const url = new URL(`/validar/${encodeURIComponent(folio)}`, normalizeBaseUrl(baseUrl));
  return url.toString();
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}
