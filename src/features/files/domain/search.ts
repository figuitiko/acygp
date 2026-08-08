export function normalizeFileSearchTerm(search?: string | null): string | null {
  const normalized = search?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}
