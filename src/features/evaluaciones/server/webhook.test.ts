import { describe, expect, it } from "vitest";

import { parseGoogleFormsSubmissionPayload, verifyGoogleFormsWebhookSecret } from "./webhook";

describe("google forms webhook helpers", () => {
  it("rejects missing or invalid webhook secrets", () => {
    expect(verifyGoogleFormsWebhookSecret({ provided: null, expected: "secret" })).toBe(false);
    expect(verifyGoogleFormsWebhookSecret({ provided: "wrong", expected: "secret" })).toBe(false);
    expect(verifyGoogleFormsWebhookSecret({ provided: "secret", expected: "secret" })).toBe(true);
    expect(() => verifyGoogleFormsWebhookSecret({ provided: "secret", expected: undefined })).toThrow();
  });

  it("parses valid payloads with stable ids, answers, timestamps, and scores", () => {
    const payload = parseGoogleFormsSubmissionPayload({
      form: { id: "form-1", title: "Evaluación" },
      response: {
        id: "response-1",
        submittedAt: "2026-07-26T10:00:00.000Z",
        respondentEmail: "ana@example.com",
        score: 8,
        maxScore: 10,
      },
      answers: [
        {
          itemId: "item-name",
          title: "Nombre",
          answer: "Ana López",
          score: null,
          maxScore: null,
        },
      ],
    });

    expect(payload.form.id).toBe("form-1");
    expect(payload.response.id).toBe("response-1");
    expect(payload.answers[0]?.itemId).toBe("item-name");
    expect(payload.response.score).toBe(8);
  });

  it("rejects malformed payloads", () => {
    expect(() => parseGoogleFormsSubmissionPayload({ form: { id: "" } })).toThrow();
  });
});
