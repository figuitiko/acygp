export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_FILE_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

export type FileValidationError = "empty-name" | "file-too-large" | "unsupported-type";

export function validateFileUpload(input: {
  name: string;
  size: number;
  contentType: string;
}): FileValidationError | null {
  if (!input.name.trim()) {
    return "empty-name";
  }

  if (input.size <= 0 || input.size > MAX_FILE_SIZE_BYTES) {
    return "file-too-large";
  }

  if (!ALLOWED_FILE_CONTENT_TYPES.has(input.contentType)) {
    return "unsupported-type";
  }

  return null;
}

export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[/\\?%*:|"<>]/g, "-");
}
