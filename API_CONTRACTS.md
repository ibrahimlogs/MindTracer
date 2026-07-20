# API contracts

All API responses use the standard envelope:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

Failures return:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "The session cannot move from retry_required to transfer_presented.",
    "details": null
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

## Session endpoints

- `POST /api/sessions`
- `GET /api/sessions/[sessionId]`
- `POST /api/sessions/[sessionId]/attempts`
- `POST /api/sessions/[sessionId]/analysis`
- `POST /api/sessions/[sessionId]/hypotheses`
- `POST /api/sessions/[sessionId]/verification`
- `POST /api/sessions/[sessionId]/verification/submit`
- `POST /api/sessions/[sessionId]/interventions`
- `POST /api/sessions/[sessionId]/interventions/more-help`
- `POST /api/sessions/[sessionId]/interventions/acknowledge`
- `POST /api/sessions/[sessionId]/retry`
- `POST /api/sessions/[sessionId]/delta`
- `POST /api/sessions/[sessionId]/transfer/start`
- `POST /api/sessions/[sessionId]/transfer/submit`
- `GET /api/sessions/[sessionId]/report`
- `POST /api/sessions/[sessionId]/restart`

## Create session

Request:

```json
{
  "mode": "compare",
  "learnerKey": "learner-a",
  "problemId": "ads_sales_001"
}
```

Response data:

```json
{
  "sessionId": "...",
  "publicId": "...",
  "mode": "compare",
  "currentStage": "problem_presented",
  "status": "active",
  "fallbackMode": true
}
```

## Write request requirements

Every write endpoint after creation requires:

```http
Idempotency-Key: browser-generated-key
```

Payloads are validated with Zod. Replaying the same key and same payload returns the original response. Reusing the key with a different payload returns `IDEMPOTENCY_PAYLOAD_MISMATCH`.

## Stable error codes

- `VALIDATION_ERROR`
- `SESSION_NOT_FOUND`
- `SESSION_EXPIRED`
- `SESSION_COMPLETED`
- `INVALID_STATE_TRANSITION`
- `DUPLICATE_SUBMISSION`
- `PROBLEM_NOT_FOUND`
- `VERIFICATION_NOT_PENDING`
- `INTERVENTION_NOT_READY`
- `TRANSFER_NOT_READY`
- `DATABASE_UNAVAILABLE`
- `INTERNAL_ERROR`

## Step 7 hypothesis and verification behavior

`POST /api/sessions/[sessionId]/hypotheses` retrieves allowed misconception candidates, ranks up to three hypotheses, applies the verification policy, stores the hypothesis snapshot, records a `SessionEvent`, and advances to `verification_required` or `intervention_ready`.

`POST /api/sessions/[sessionId]/verification` creates one pending verification interaction for the current hypothesis state. It does not duplicate an existing pending question for the same ranked hypotheses.

`POST /api/sessions/[sessionId]/verification/submit` evaluates the learner response, saves before/after hypothesis JSON in the session snapshot, records supported/weakened/rejected hypotheses, and advances to `intervention_ready` unless one more bounded verification check is genuinely required.

Learner-facing responses do not expose internal misconception IDs as labels, model confidence numbers, raw prompts, raw OpenAI payloads, or hidden database identifiers. Pipeline mode can show developer-safe candidate IDs, matched signals, ranker source, and policy decisions.

## Step 8 intervention behavior

`POST /api/sessions/[sessionId]/interventions` selects and stores the smallest useful bounded support for the verified state, then advances the session to `intervention_shown`.

`POST /api/sessions/[sessionId]/interventions/more-help` requires an existing intervention and records learner-requested escalation before selecting the next allowed support level.

`POST /api/sessions/[sessionId]/interventions/acknowledge` records the learner interaction, updates support usage, and advances to `retry_required`.

Intervention responses are hydrated through the session snapshot. Learner-facing content must preserve prior understanding, avoid diagnosis labels, and avoid final-answer leakage below the full-reconstruction level.

## Step 6 analysis response

`POST /api/sessions/[sessionId]/analysis` now runs the selected reasoning analyzer.

Learner-facing response data includes:

```json
{
  "sessionId": "mt_...",
  "stage": "hypothesis_ready",
  "analysisSource": "deterministic",
  "summary": {
    "preservedUnderstanding": ["You noticed that the values increase."],
    "stillUnclear": [
      "It is not yet clear whether the repeated change between rows was compared."
    ],
    "nextSystemAction": "MindTrace will check one small part of the reasoning before choosing support."
  },
  "extractionConfidenceBand": "medium",
  "needsClarification": true
}
```

The endpoint does not return raw prompt text, internal notes, OpenAI response IDs, or model metadata to learners. Pipeline/developer mode may display safe observed/inferred/unclear fields from the hydrated session snapshot.
