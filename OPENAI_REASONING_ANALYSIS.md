# OpenAI reasoning analysis

Step 6 adds OpenAI Structured Reasoning Extraction. The model has one narrow job: convert a learner answer and explanation into structured, evidence-grounded reasoning signals.

## Responsibility

The analyzer may extract:

- observed claims
- minimally inferred reasoning steps
- relationship claimed
- operations used
- evidence referenced or clearly ignored
- uncertainty and contradiction signals
- safe learner-facing summary

The analyzer must not:

- diagnose a misconception as fact
- generate verification questions
- teach, hint, correct, or reveal the answer
- infer intelligence, personality, motivation, emotion, or learning style
- create mastery percentages
- provide chain-of-thought

## Analyzer modes

`REASONING_ANALYZER_MODE` supports:

- `deterministic`: use the local deterministic extractor only.
- `openai`: require live OpenAI and fail safely if unavailable.
- `fallback`: attempt OpenAI, then use deterministic extraction after retryable failure.

Ordinary tests use deterministic mode and do not require `OPENAI_API_KEY`.

## Responses API strategy

The live analyzer uses the official OpenAI SDK with the Responses API:

- `responses.parse`
- `text.format` with Zod Structured Outputs
- `store: false`
- explicit timeout
- one bounded retry for retryable failures
- Zod validation after parsing
- safety validation after schema validation

Prompt ID: `reasoning-extractor-v1`

## Input limits

- learner answer: 500 characters
- learner explanation: 2,000 characters
- selected approach: controlled value from the app
- confidence: controlled value from the app
- problem context: curated dataset only

## Failure handling

Stable internal AI categories:

- `AI_NOT_CONFIGURED`
- `AI_AUTHENTICATION_ERROR`
- `AI_RATE_LIMITED`
- `AI_TIMEOUT`
- `AI_NETWORK_ERROR`
- `AI_REFUSAL`
- `AI_INCOMPLETE_RESPONSE`
- `AI_INVALID_STRUCTURED_OUTPUT`
- `AI_EMPTY_RESPONSE`
- `AI_INTERNAL_ERROR`

OpenAI-only mode does not silently fall back. Fallback mode records source as `fallback` and keeps the session functional.

## Known limitations

- Live OpenAI smoke testing is opt-in and was not run without a key.
- Database-backed ReasoningAnalysis persistence is schema-compatible, but this workspace still validates the fallback repository path.
- The model extracts reasoning evidence only; Step 7 will rank misconception hypotheses.
