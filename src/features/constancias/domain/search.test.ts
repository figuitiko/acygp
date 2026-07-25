import { describe, expect, it } from "vitest";

import { normalizeConstanciasSearchTerm } from "./search";

describe("normalizeConstanciasSearchTerm", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeConstanciasSearchTerm("  Frank   Nutri  ")).toBe("Frank Nutri");
  });

  it("returns null for blank searches", () => {
    expect(normalizeConstanciasSearchTerm("   ")).toBeNull();
    expect(normalizeConstanciasSearchTerm(undefined)).toBeNull();
  });
});
