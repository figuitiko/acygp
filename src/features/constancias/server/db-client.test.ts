import { describe, expect, it } from "vitest";

import { canReusePrismaClient } from "./db-client";

describe("canReusePrismaClient", () => {
  it("reuses clients that expose all required model delegates", () => {
    expect(
      canReusePrismaClient({
        constancia: {},
        evaluationForm: {},
        evaluationQuestion: {},
        evaluationSubmission: {},
        evaluationAnswer: {},
      })
    ).toBe(true);
  });

  it("rejects stale clients generated before evaluation models existed", () => {
    expect(canReusePrismaClient({ constancia: {} })).toBe(false);
  });

  it("rejects nullish clients", () => {
    expect(canReusePrismaClient(undefined)).toBe(false);
  });
});
