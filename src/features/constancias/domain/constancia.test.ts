import { describe, expect, it } from "vitest";

import {
  buildConstanciaValidationUrl,
  createConstanciaHash,
  createConstanciaPayload,
  formatConstanciaFolio,
} from "./constancia";

describe("constancia domain", () => {
  const baseInput = {
    recipientName: "  María   Pérez López  ",
    courseName: "Evaluación EC0217.01",
    standardCode: "EC0217.01",
    issuedAt: new Date("2026-07-24T15:00:00.000Z"),
  };

  it("formats folios by year with a six-digit sequence", () => {
    expect(formatConstanciaFolio(2026, 1)).toBe("ACyGP-2026-000001");
    expect(formatConstanciaFolio(2026, 123)).toBe("ACyGP-2026-000123");
  });

  it("creates a canonical payload with normalized public constancia data", () => {
    expect(createConstanciaPayload({ ...baseInput, folio: "ACyGP-2026-000001" })).toEqual({
      folio: "ACyGP-2026-000001",
      recipientName: "María Pérez López",
      courseName: "Evaluación EC0217.01",
      standardCode: "EC0217.01",
      issuedAt: "2026-07-24",
    });
  });

  it("generates deterministic hashes from canonical data and secret", () => {
    const first = createConstanciaHash({
      payload: createConstanciaPayload({ ...baseInput, folio: "ACyGP-2026-000001" }),
      secret: "test-secret",
    });

    const second = createConstanciaHash({
      payload: createConstanciaPayload({ ...baseInput, folio: "ACyGP-2026-000001" }),
      secret: "test-secret",
    });

    const changed = createConstanciaHash({
      payload: createConstanciaPayload({ ...baseInput, folio: "ACyGP-2026-000002" }),
      secret: "test-secret",
    });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
    expect(changed).not.toBe(first);
  });

  it("builds public validation URLs from the folio", () => {
    expect(
      buildConstanciaValidationUrl({
        baseUrl: "https://acygp.example.com/",
        folio: "ACyGP-2026-000001",
      })
    ).toBe("https://acygp.example.com/validar/ACyGP-2026-000001");
  });
});
