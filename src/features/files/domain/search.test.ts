import { describe, expect, it } from "vitest";

import { normalizeFileSearchTerm } from "./search";

describe("normalizeFileSearchTerm", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeFileSearchTerm("  formulario   registro  ")).toBe("formulario registro");
  });

  it("returns null for blank searches", () => {
    expect(normalizeFileSearchTerm("   ")).toBeNull();
    expect(normalizeFileSearchTerm(undefined)).toBeNull();
  });
});
