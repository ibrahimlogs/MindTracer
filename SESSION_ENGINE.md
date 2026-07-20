# Session engine

Step 5 introduces an anonymous session lifecycle behind the deterministic MindTrace demo.

## State machine

Allowed stages:

`problem_presented → initial_attempt → reasoning_analysis → hypothesis_ready → verification_required → verification_submitted → intervention_ready → intervention_shown → retry_required → retry_submitted → reasoning_delta → transfer_presented → transfer_submitted → session_complete`

`hypothesis_ready` may also move directly to `intervention_ready` for future flows that do not require verification.

The server-side transition table lives in `src/lib/session-engine/transitions.ts`. Invalid transitions return `INVALID_STATE_TRANSITION`.

## Persistence strategy

The Prisma schema and migration define PostgreSQL product tables for educational records, anonymous sessions, attempts, deterministic analysis records, misconception hypotheses, verification interactions, interventions, transfer attempts, reports, lifecycle events, and idempotency records.

When `DATABASE_URL` is not configured, the session API uses explicit in-memory fallback mode for development review. Fallback mode is not durable across server restarts and does not pretend to be production persistence.

## Deterministic services

Step 5 keeps reasoning deterministic through replaceable interfaces:

- `ReasoningAnalyzer`
- `HypothesisGenerator`
- `VerificationService`
- `InterventionSelector`
- `ReasoningDeltaEvaluator`
- `TransferEvaluator`

Reasoning extraction is now delegated to Step 6 analyzer implementations:

- deterministic
- OpenAI Responses API
- fallback from OpenAI to deterministic after retryable failure

The remaining services still use curated dataset and demo records.

## Idempotency

Write endpoints require `Idempotency-Key`. The session engine scopes replay to the session action, hashes the normalized payload, returns the original response for exact replay, and rejects reused keys with different payloads.

## Refresh and resume

Generated demo URLs use a public session ID. The workspace loads `/api/sessions/[sessionId]` on mount and hydrates learner, stage, completed stages, attempts, verification, retry, transfer, and report snapshot data.

## Cleanup

Anonymous sessions include `expiresAt`. Cleanup is manual:

```bash
corepack pnpm sessions:cleanup
corepack pnpm sessions:cleanup -- --execute
```

Without `--execute`, cleanup is a dry run. No cleanup runs during normal requests.

## Known limitations

- In-memory fallback is process-local and not durable.
- Database-backed repository operations are scaffolded through Prisma schema, migration, and seed scripts; this workspace validation did not have a live PostgreSQL URL.
- Sessions are anonymous.
- No authentication, production analytics, or automated cleanup exists yet.
