# Planned architecture

MindTrace is organized around a staged reasoning lifecycle while keeping model calls behind server boundaries. The current code establishes the technical, visual, dataset, and anonymous session foundations while keeping reasoning behavior deterministic.

## Application layer

`src/app` uses the Next.js App Router. Public product positioning lives at `/`, `/demo`, and `/technology`. The Learning Workspace lives at `/demo/session/[sessionId]`, the Reasoning Delta report lives at `/report/[sessionId]`, and the development dataset explorer lives at `/technology/dataset`. Session APIs live under `/api/sessions`. Route loading states, a recoverable error boundary, and the `/api/health` response envelope remain intact.

The landing and positioning pages are server components by default. Client components are limited to behavior that requires them: the animated headline, reasoning-delta explanation, and optional 3D enhancement. Mobile navigation uses a native disclosure and does not require hydration.

## Visual system

Reusable primitives are grouped by responsibility:

- `components/layout` owns the page shell, 1440px section container, grids, stacks, headings, navigation, and footer.
- `components/ui` owns typed actions, surfaces, status and evidence treatments, metrics, typography labels, and comparison primitives.
- `components/visualization` owns reasoning nodes, connectors, the static fallback, and isolated Three.js canvas.
- `components/landing` owns small, editorial section compositions rather than one oversized page component.

Design tokens live in `src/app/globals.css`. Components consume semantic Tailwind names or CSS variables rather than duplicating color constants. Motion timing and reduced-motion behavior are also centralized there.

## 3D enhancement boundary

The hero's essential meaning is server-rendered as an HTML reasoning path. A small client enhancement checks viewport visibility, viewport width, reduced-motion preference, page visibility, and WebGL support. Only then does it dynamically import the React Three Fiber canvas.

The canvas uses lightweight spheres and lines, constrained device-pixel ratio, low-power rendering preference, and no post-processing. Its render loop stops when the visual leaves the viewport or the tab becomes hidden. Mobile, reduced-motion, and WebGL-unavailable environments retain the static reasoning path.

## Domain and data layer

Step 4 adds a prototype curated education dataset under `src/data/education`. It contains controlled concept records, problem records, misconception hypotheses, verification-question templates, ordered intervention ladders, transfer mappings, fixed reasoning rubrics, and curated evaluation cases. Zod validators enforce schema rules and cross-record references, while typed loaders expose readonly-safe records for the demo and future database seeding.

Step 3 deterministic learner scripts still live under `src/data/demo`, but shared educational content now resolves from the Step 4 dataset. Learner A and Learner B share the same wrong answer while following different mocked reasoning paths, verification questions, interventions, and Reasoning Delta reports.

Step 5 adds Prisma product models and the initial migration for concepts, problems, misconceptions, anonymous sessions, attempts, deterministic analysis records, hypotheses, verification, interventions, transfers, reports, lifecycle events, and idempotency records. The seed script reads the validated Step 4 dataset and upserts educational records when a PostgreSQL URL is configured.

Domain services are planned under `src/lib/misconception`, `intervention`, and `analytics`.

## AI boundary

`src/lib/ai` exposes a lazy, server-only OpenAI client placeholder. Future model calls must return schema-validated structured output behind server boundaries. Hypotheses must remain labeled as inference, while observations and learner-provided evidence remain distinct. Step 5 route handlers use deterministic service interfaces and do not call OpenAI.

## State and validation

The server-side session engine defines the authoritative lifecycle transitions. Zustand now acts as a client adapter for the latest server snapshot, pending UI actions, deterministic controls, and fallback-safe hydration. React Hook Form coordinates workspace forms with shared Zod schemas. Environment variables, education records, session requests, path params, and API bodies are validated at their boundary.

## Operational foundation

API handlers use consistent success/error envelopes with request metadata. The logger emits structured records behind a replaceable interface. Vitest covers isolated logic, fallback meaning, education dataset invariants, session transitions, idempotency, and guarded writes. Playwright uses the production server with bounded worker concurrency to verify routes, navigation, responsive layout, fallbacks, hydration behavior, API-created sessions, refresh/resume, reports, and the dataset explorer.

Error reporting transport, analytics transport, rate limiting, production telemetry, durable learning sessions, live misconception logic, and real evaluation logic are planned but not implemented.
