export function normalizeConstanciasSearchTerm(search?: string | null) {
  const normalized = search?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}
