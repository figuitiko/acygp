import { describe, expect, it } from "vitest";

import { sanitizeFileName, validateFileUpload } from "./file";

describe("validateFileUpload", () => {
  const validInput = { name: "formulario.pdf", size: 1024, contentType: "application/pdf" };

  it("accepts a small, allowed file", () => {
    expect(validateFileUpload(validInput)).toBeNull();
  });

  it("rejects a blank name", () => {
    expect(validateFileUpload({ ...validInput, name: "   " })).toBe("empty-name");
  });

  it("rejects files over 4MB", () => {
    expect(validateFileUpload({ ...validInput, size: 4 * 1024 * 1024 + 1 })).toBe("file-too-large");
  });

  it("rejects empty files", () => {
    expect(validateFileUpload({ ...validInput, size: 0 })).toBe("file-too-large");
  });

  it("rejects unsupported content types", () => {
    expect(validateFileUpload({ ...validInput, contentType: "application/zip" })).toBe("unsupported-type");
  });
});

describe("sanitizeFileName", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeFileName("  formulario   de registro.pdf  ")).toBe("formulario de registro.pdf");
  });

  it("replaces path and reserved characters with a dash", () => {
    expect(sanitizeFileName('a/b\\c?d%e*f:g|h"i<j>k.pdf')).toBe("a-b-c-d-e-f-g-h-i-j-k.pdf");
  });
});
