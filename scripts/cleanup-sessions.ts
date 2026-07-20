import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.ts";
import { SessionStatus } from "../src/generated/prisma/enums.ts";

const dryRun = !process.argv.includes("--execute");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log(
      "DATABASE_URL is not configured; expired-session cleanup is a no-op in fallback mode.",
    );
    console.table({ dryRun, expiredCount: 0, deletedCount: 0 });
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const where = {
    expiresAt: { lt: new Date() },
    status: {
      in: [
        SessionStatus.active,
        SessionStatus.abandoned,
        SessionStatus.expired,
      ],
    },
  };
  const expiredCount = await prisma.learningSession.count({ where });
  const deletedCount = dryRun
    ? 0
    : (
        await prisma.learningSession.deleteMany({
          where,
        })
      ).count;

  await prisma.$disconnect();
  console.table({ dryRun, expiredCount, deletedCount });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
