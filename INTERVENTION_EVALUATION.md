# Intervention evaluation

Step 8 includes a deterministic prototype evaluation harness for intervention selection.

## Command

```bash
corepack pnpm evaluate:intervention -- --mode=deterministic
```

The command reads the curated education dataset, runs deterministic intervention selection for the prototype evaluation cases, prints aggregate metrics, and writes a local gitignored artifact to `artifacts/intervention-evaluation/latest.json`.

## Metrics

The harness checks:

- intervention-family agreement;
- allowed starting-level range;
- visualizer-type agreement;
- answer leakage rate;
- forbidden level-8 usage rate;
- unknown record rate;
- preserved-understanding validity;
- escalation policy agreement;
- prohibited learner-facing output rate;
- fallback rate;
- average local latency.

These metrics are prototype checks, not external benchmark claims.

## Optional OpenAI smoke

```bash
corepack pnpm test:openai:intervention-smoke
```

The smoke command skips when `OPENAI_API_KEY` is absent. Live output quality is not claimed until reviewed credentials and reviewed outputs are available.
