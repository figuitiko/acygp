import { describe, expect, it } from "vitest";

import { normalizePostgresConnectionUrl } from "./database-url";

describe("normalizePostgresConnectionUrl", () => {
  it("keeps Neon SSL behavior explicit by rewriting sslmode=require to verify-full", () => {
    const normalized = normalizePostgresConnectionUrl(
      "postgresql://user:pass@example.neon.tech/neondb?sslmode=require"
    );

    expect(new URL(normalized).searchParams.get("sslmode")).toBe("verify-full");
  });

  it("preserves existing query parameters", () => {
    const normalized = normalizePostgresConnectionUrl(
      "postgresql://user:pass@example.neon.tech/neondb?schema=public&sslmode=require"
    );
    const url = new URL(normalized);

    expect(url.searchParams.get("schema")).toBe("public");
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
  });

  it("does not change URLs that already use explicit SSL semantics", () => {
    const connectionUrl = "postgresql://user:pass@example.neon.tech/neondb?sslmode=verify-full";

    expect(normalizePostgresConnectionUrl(connectionUrl)).toBe(connectionUrl);
  });
});
