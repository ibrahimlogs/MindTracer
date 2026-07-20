# AI privacy

OpenAI reasoning extraction is optional and server-side only.

## Sent to OpenAI in live mode

Only the minimum reasoning-analysis payload is sent:

- session public ID
- problem ID
- concept IDs
- curated problem context
- curated data representation
- question
- deterministic answer status
- solution-model concepts
- learner answer
- learner explanation
- selected approach
- self-reported confidence
- attempt type
- allowed operation vocabulary
- prompt version

The solution model is included only so the extractor understands the target concept. The prompt explicitly forbids revealing the solution in output.

## Not sent

MindTrace does not send:

- user name
- email
- IP address
- authentication identifiers
- full session history
- hidden internal database IDs
- unrelated learner responses
- API keys

## Retention behavior

The Responses API request uses `store: false` through `OPENAI_STORE_RESPONSES=false` by default.

MindTrace stores only structured extraction output, safe learner summary, prompt version, source, and model metadata. It does not store chain-of-thought or raw OpenAI headers.

## Debug logging

Default telemetry logs model/source/latency/retry metadata and does not log the full prompt or full learner explanation.

## Modes

Use `REASONING_ANALYZER_MODE=deterministic` to avoid OpenAI calls entirely.

Use `REASONING_ANALYZER_MODE=fallback` to keep sessions functional when retryable OpenAI failures occur.

## Step 7 misconception ranking

`MISCONCEPTION_RANKER_MODE=deterministic` avoids OpenAI calls entirely.

If `MISCONCEPTION_RANKER_MODE=openai`, only a bounded ranking payload is sent: session public ID, problem ID, concept IDs, learner attempt summary, structured reasoning analysis, retrieved curated candidates, allowed candidate IDs, verification history, and prompt version. The ranker may only rank supplied candidate IDs and must not create diagnoses, verification questions, teaching content, or learner trait claims.

`VERIFICATION_ADAPTER_MODE` and `VERIFICATION_EVALUATOR_MODE` are configured now, but Step 7 uses deterministic template adaptation and deterministic response evaluation in ordinary operation. Live verification smoke testing is opt-in and skipped without `OPENAI_API_KEY`.
