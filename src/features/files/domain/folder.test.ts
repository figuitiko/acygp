import { describe, expect, it } from "vitest";

import { normalizeFolderName } from "./folder";

describe("normalizeFolderName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeFolderName("  Formularios   internos  ")).toBe("Formularios internos");
  });

  it("returns null for blank names", () => {
    expect(normalizeFolderName("   ")).toBeNull();
    expect(normalizeFolderName(undefined)).toBeNull();
    expect(normalizeFolderName(null)).toBeNull();
  });
});
