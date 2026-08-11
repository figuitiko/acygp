export function normalizeFolderName(name?: string | null): string | null {
  const normalized = name?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}
