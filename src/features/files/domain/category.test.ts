import { describe, expect, it } from "vitest";

import { normalizeCategoryName } from "./category";

describe("normalizeCategoryName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeCategoryName("  Formularios   internos  ")).toBe("Formularios internos");
  });

  it("returns null for blank names", () => {
    expect(normalizeCategoryName("   ")).toBeNull();
    expect(normalizeCategoryName(undefined)).toBeNull();
    expect(normalizeCategoryName(null)).toBeNull();
  });
});
