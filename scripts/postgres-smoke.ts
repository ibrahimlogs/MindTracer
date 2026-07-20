if (!process.env.DATABASE_URL) {
  console.log(
    "Skipped: missing configuration. DATABASE_URL is required for the live PostgreSQL smoke test.",
  );
  process.exit(0);
}

if (process.env.SAFE_TEST_DATABASE !== "true") {
  console.log(
    "Skipped: SAFE_TEST_DATABASE=true is required before touching a configured PostgreSQL database.",
  );
  process.exit(0);
}

console.log(
  "PostgreSQL smoke test guard passed. Run prisma migrations and test-owned session checks against this confirmed safe test database.",
);
