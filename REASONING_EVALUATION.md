# Reasoning extraction evaluation

Step 6 includes a prototype extraction-quality harness over the 30 curated Step 4 evaluation cases.

Run deterministic evaluation:

```bash
corepack pnpm evaluate:reasoning -- --mode=deterministic
```

The command writes a local report to:

`artifacts/reasoning-evaluation/latest.json`

That directory is gitignored.

## Report metrics

The harness reports extraction-quality prototype metrics:

- schema-valid output rate
- clarification-needed rate
- prohibited-output rate
- fallback rate
- average latency

These are not educational outcome metrics and must not be described as learner mastery, model accuracy, or benchmark performance.

## Human review structure

Each generated review item includes:

- `expected`
- `actual`
- `match`
- `reviewerNote`
- `reviewStatus`

Allowed review statuses:

- `unreviewed`
- `accepted`
- `rejected`
- `needs_discussion`

Do not claim model quality until outputs have been generated and reviewed.

## Live smoke test

Run:

```bash
corepack pnpm test:openai:smoke
```

If `OPENAI_API_KEY` is absent, the command skips clearly. It is not part of ordinary CI.
