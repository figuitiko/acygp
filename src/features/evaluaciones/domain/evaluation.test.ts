import { describe, expect, it } from "vitest";

import {
  calculateEvaluationOutcome,
  normalizeEvaluationSearchTerm,
  parseOptionalScore,
  requireValidMapping,
} from "./evaluation";

describe("evaluation domain", () => {
  it("calculates pass/fail at, above, and below the threshold", () => {
    expect(calculateEvaluationOutcome({ score: 8, maxScore: 10, passingThreshold: 80 })).toBe("PASS");
    expect(calculateEvaluationOutcome({ score: 9, maxScore: 10, passingThreshold: 80 })).toBe("PASS");
    expect(calculateEvaluationOutcome({ score: 7.9, maxScore: 10, passingThreshold: 80 })).toBe("FAIL");
  });

  it("rejects impossible score inputs", () => {
    expect(() => calculateEvaluationOutcome({ score: -1, maxScore: 10, passingThreshold: 80 })).toThrow();
    expect(() => calculateEvaluationOutcome({ score: 11, maxScore: 10, passingThreshold: 80 })).toThrow();
    expect(() => calculateEvaluationOutcome({ score: 8, maxScore: 0, passingThreshold: 80 })).toThrow();
  });

  it("requires name, email, evaluation name, and threshold mapping", () => {
    expect(() =>
      requireValidMapping({
        participantNameQuestionId: "q-name",
        participantEmailQuestionId: null,
        useRespondentEmail: true,
        evaluationName: "Evaluación EC0217",
        passingThreshold: 80,
      })
    ).not.toThrow();

    expect(() =>
      requireValidMapping({
        participantNameQuestionId: "q-name",
        participantEmailQuestionId: null,
        useRespondentEmail: false,
        evaluationName: "Evaluación EC0217",
        passingThreshold: 80,
      })
    ).toThrow("email");
  });

  it("parses optional manual scores from form fields", () => {
    expect(parseOptionalScore("8.5")).toBe(8.5);
    expect(parseOptionalScore("")).toBeNull();
    expect(parseOptionalScore(null)).toBeNull();
    expect(() => parseOptionalScore("abc")).toThrow();
  });

  it("normalizes search input", () => {
    expect(normalizeEvaluationSearchTerm("  Ana   López  ")).toBe("Ana López");
    expect(normalizeEvaluationSearchTerm("   ")).toBeNull();
  });
});
