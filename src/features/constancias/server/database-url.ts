const LIBPQ_COMPAT_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

export function normalizePostgresConnectionUrl(connectionString: string) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");

  if (sslMode && LIBPQ_COMPAT_SSL_MODES.has(sslMode)) {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}
