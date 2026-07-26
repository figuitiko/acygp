import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

import { normalizePostgresConnectionUrl } from "./database-url";
import { canReusePrismaClient } from "./db-client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for constancia persistence");
  }

  const adapter = new PrismaPg({
    connectionString: normalizePostgresConnectionUrl(connectionString),
  });

  return new PrismaClient({ adapter });
}

export const prisma = canReusePrismaClient(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
