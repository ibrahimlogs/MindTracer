# Planned architecture

MindTrace is organized around a staged reasoning lifecycle while keeping model calls behind server boundaries. The current code establishes those boundaries and types; it does not claim that the workflow exists yet.

## Application layer

`src/app` uses the Next.js App Router. Public product context lives at `/`, `/demo`, and `/technology`. Session and report views use dynamic IDs at `/demo/session/[sessionId]` and `/report/[sessionId]`. Route loading states and a global recoverable error boundary are already present. `/api/health` demonstrates the standard API response envelope.

## Component layer

Components are grouped by responsibility rather than page alone:

- `landing` contains the product introduction.
- `problem` will own problem presentation and response collection.
- `reasoning` will own verification-question interactions.
- `visualization` will present reasoning and evidence structures.
- `mindtrace` will coordinate product-specific workflow views.
- `report` will render evidence and transfer outcomes.
- `layout` contains shared application framing.
- `ui` contains small shadcn-compatible primitives.

The empty responsibility folders are deliberate extension points, not implemented features.

## Domain and data layer

Static, reviewed fixtures are separated into concepts, problems, misconceptions, and evaluation data. Domain services are planned under `src/lib/misconception`, `intervention`, and `analytics`. Prisma is configured for PostgreSQL, but production models will be introduced only when the session lifecycle and retention requirements are defined.

## AI boundary

`src/lib/ai` exposes a lazy, server-side OpenAI client placeholder. Future model calls should return schema-validated structured output and remain behind route handlers or server actions. Hypotheses must be labeled as inference; observations and learner-provided evidence must remain distinct. No prompt or reasoning workflow exists yet.

## State and validation

Zustand is reserved for ephemeral client interaction state. Durable session state will belong in PostgreSQL. React Hook Form will coordinate forms with shared Zod schemas. Environment variables and request payloads are validated at their boundary.

## Operational foundation

API handlers use consistent success/error envelopes. The logger currently emits structured console records and can later be replaced by an observability transport without changing call sites. Vitest covers isolated logic and Playwright smoke-tests critical routes. Error reporting, analytics transport, rate limiting, and production telemetry are planned but not implemented.
