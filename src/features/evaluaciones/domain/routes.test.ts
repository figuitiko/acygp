import { describe, expect, it } from "vitest";

import { buildIndividualEvaluationPdfPath, buildEvaluationDetailPath } from "./routes";

describe("evaluation admin routes", () => {
  it("builds one individual PDF route per evaluation submission", () => {
    expect(buildIndividualEvaluationPdfPath("submission-123")).toBe("/admin/evaluaciones/submission-123/pdf");
  });

  it("builds the detail route for a submission", () => {
    expect(buildEvaluationDetailPath("submission-123")).toBe("/admin/evaluaciones/submission-123");
  });
});
