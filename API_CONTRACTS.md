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

## Deterministic Step 5 behavior

Analysis, hypotheses, verification, interventions, reasoning delta, and transfer evaluation are deterministic and dataset-backed. The route shape is ready for Step 6 OpenAI structured extraction, but no OpenAI calls are made here.
