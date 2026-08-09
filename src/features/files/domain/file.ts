export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_FILE_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

const OFFICE_VIEWER_CONTENT_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export function buildFileViewUrl(blobUrl: string, contentType: string): string {
  if (OFFICE_VIEWER_CONTENT_TYPES.has(contentType)) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(blobUrl)}`;
  }

  return blobUrl;
}

export function buildFileDownloadUrl(blobUrl: string): string {
  const separator = blobUrl.includes("?") ? "&" : "?";
  return `${blobUrl}${separator}download=1`;
}
