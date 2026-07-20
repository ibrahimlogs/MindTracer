import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnv } from "@/lib/validation/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const databaseUrl = getServerEnv().DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_UNAVAILABLE");
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });
  return new PrismaClient({ adapter });
}

export function getDatabase() {
  const prisma = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export function hasDatabaseUrl() {
  return Boolean(getServerEnv().DATABASE_URL);
}
