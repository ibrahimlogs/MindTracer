# Intervention engine

Step 8 adds the bounded support layer that runs after a misconception has been verified. The engine chooses the smallest useful intervention, records how much support has been used, and keeps answer-revealing help behind explicit policy gates.

## Scope

Implemented now:

- deterministic intervention-family resolution from verified misconception state;
- starting-level selection for levels 1-8;
- learner-requested escalation through `/interventions/more-help`;
- acknowledgement through `/interventions/acknowledge`;
- intervention history and support-usage summaries in the session snapshot;
- safety validation for answer leakage and full-answer reveal policy;
- a lazy server-only OpenAI adapter boundary.

Implemented after Step 8:

- Step 9 now consumes intervention history and support summaries when evaluating retry independence and transfer readiness.

Still not implemented:

- free-form tutoring;
- production personalization;
- teacher dashboard.

## Policy

The automatic retry path is capped at level 4. Levels 5-8 exist in the schema and policy language, but require a later trigger such as explicit help escalation policy, failed retry handling, demo progression, or accommodation. Step 8 only exposes learner-requested escalation within the current cap.

Families are selected from curated misconception and verification data. If the verified state is unresolved, the engine uses conservative evidence comparison rather than asserting a diagnosis.

## Server boundary

`src/lib/intervention-engine` owns selection, rendering config, safety checks, telemetry, and adapter creation. API routes call the session service; route handlers do not contain educational policy.

`INTERVENTION_SELECTOR_MODE` and `INTERVENTION_ADAPTER_MODE` default to `deterministic`. The OpenAI adapter is intentionally lazy and server-only. Without `OPENAI_API_KEY`, optional smoke tests skip rather than falling back silently to a live call.

## Learner safety

Interventions preserve something the learner understood before naming the next small comparison. Lower levels must not expose the final answer or final equation. Safety validation checks learner-facing text, captions, and accessibility summaries for answer leakage.
