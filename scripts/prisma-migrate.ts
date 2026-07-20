import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log(
    "DATABASE_URL is not configured; migration skipped for explicit fallback mode.",
  );
  process.exit(0);
}

const result = spawnSync(
  "node",
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  {
    stdio: "inherit",
    env: process.env,
  },
);

process.exit(result.status ?? 1);
