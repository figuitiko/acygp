import { describe, expect, it } from "vitest";

import { buildFileDownloadUrl, buildFileViewUrl, sanitizeFileName, validateFileUpload } from "./file";

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

  it("accepts PowerPoint files", () => {
    expect(validateFileUpload({ ...validInput, contentType: "application/vnd.ms-powerpoint" })).toBeNull();
    expect(
      validateFileUpload({
        ...validInput,
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      })
    ).toBeNull();
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

describe("buildFileViewUrl", () => {
  const blobUrl = "https://example.blob.vercel-storage.com/archivos/abc-formulario.pdf";

  it("returns the blob URL unchanged for natively viewable types", () => {
    expect(buildFileViewUrl(blobUrl, "application/pdf")).toBe(blobUrl);
    expect(buildFileViewUrl(blobUrl, "image/png")).toBe(blobUrl);
    expect(buildFileViewUrl(blobUrl, "image/jpeg")).toBe(blobUrl);
  });

  it("routes Office document types through the Office Online viewer", () => {
    const officeTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    for (const contentType of officeTypes) {
      expect(buildFileViewUrl(blobUrl, contentType)).toBe(
        `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(blobUrl)}`
      );
    }
  });
});

describe("buildFileDownloadUrl", () => {
  it("appends a download query param to force an attachment response", () => {
    expect(buildFileDownloadUrl("https://example.blob.vercel-storage.com/archivos/abc.pdf")).toBe(
      "https://example.blob.vercel-storage.com/archivos/abc.pdf?download=1"
    );
  });

  it("appends with & when the blob URL already has a query string", () => {
    expect(buildFileDownloadUrl("https://example.blob.vercel-storage.com/archivos/abc.pdf?x=1")).toBe(
      "https://example.blob.vercel-storage.com/archivos/abc.pdf?x=1&download=1"
    );
  });
});
