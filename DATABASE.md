# Database

MindTrace uses Prisma with a PostgreSQL-compatible database. Public landing and technology routes do not require database access.

## Local setup options

Option A: local PostgreSQL

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in `.env.local`.
3. Run:

```bash
corepack pnpm prisma:generate
corepack pnpm prisma:migrate
corepack pnpm prisma:seed
```

Option B: hosted development PostgreSQL

Use a hosted development database such as Neon or Supabase, set `DATABASE_URL`, then run the same commands.

## Migration

Initial Step 5 migration:

`20260720120000_step_05_session_engine`

It creates:

- `Concept`
- `Problem`
- `Misconception`
- `ProblemMisconception`
- `LearningSession`
- `LearnerAttempt`
- `ReasoningAnalysis`
- `MisconceptionHypothesis`
- `VerificationInteraction`
- `Intervention`
- `TransferAttempt`
- `ReasoningDeltaReport`
- `SessionEvent`
- `IdempotencyRecord`

## Seeding

```bash
corepack pnpm prisma:seed
```

The seed script validates the Step 4 dataset, upserts concepts/problems/misconceptions, synchronizes problem-misconception relations, records `step-04-prototype-v1` as the source version, and reports counts.

The normal seed does not delete user sessions.

## Fallback mode

If `DATABASE_URL` is missing and `ALLOW_IN_MEMORY_SESSION_FALLBACK=true`, session APIs use in-memory fallback mode. This keeps review routes usable without secrets, but data is not durable across server restarts.

Fallback is for development/demo review only.

## Cleanup

Anonymous sessions have `expiresAt`. Cleanup is manual and dry-run by default:

```bash
corepack pnpm sessions:cleanup
corepack pnpm sessions:cleanup -- --execute
```

Cleanup automation is not implemented yet.
