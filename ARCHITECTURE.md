# Planned architecture

MindTrace is organized around a staged reasoning lifecycle while keeping model calls behind server boundaries. The current code establishes the technical, visual, dataset, anonymous session, structured reasoning-extraction, verification, and adaptive intervention foundations.

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

Step 7 adds `src/lib/misconception-engine`, the first real misconception-ranking boundary. It deterministically retrieves allowed candidates from the curated dataset, ranks no more than three, applies a verification policy, selects one approved verification template, evaluates the learner response, and records an audit trail. The engine can optionally use OpenAI for ranking, but only over deterministically retrieved candidate IDs.

Step 8 adds `src/lib/intervention-engine`. It resolves a verified misconception to an intervention family, chooses a bounded support level, creates visualizer configuration, validates answer-leakage policy, records support usage, and exposes lazy deterministic/OpenAI adapter boundaries. Intervention visuals live under `src/components/visualization/interventions` and are driven by the server snapshot rather than client-side diagnosis logic.

Step 9 adds `src/lib/reasoning-delta` and `src/lib/transfer-engine`. Retry analysis reuses the existing reasoning analyzer without overwriting the initial analysis. The delta engine compares before/after reasoning with fixed qualitative dimensions. The transfer engine selects only curated transfer problems, applies support fading, analyzes transfer reasoning, evaluates concept application separately from answer correctness, and updates the final report.

## AI boundary

`src/lib/ai/reasoning` owns Step 6 reasoning extraction. It defines a typed analyzer interface, deterministic analyzer, OpenAI Responses API analyzer, fallback factory, versioned prompt, Zod structured-output schema, safety validator, mapper, errors, and telemetry. The OpenAI analyzer uses Structured Outputs through `responses.parse`, requests `store: false`, validates output with Zod, and records only safe metadata.

The Step 6 model extracts observable reasoning evidence only. Step 7 adds an optional OpenAI ranker for curated misconception candidates using prompt `misconception-ranker-v1`, Structured Outputs, and `store: false`. It may not create IDs, diagnose, teach, correct, reveal answers, or infer learner traits. Verification question selection and response evaluation currently run deterministic/fallback-safe paths.

Step 8 adds a lazy server-only intervention adapter boundary. Step 9 adds lazy delta and transfer evaluator boundaries. Deterministic mode is the default; OpenAI-only mode must fail safely without silent fallback. These evaluators may not invent rubric dimensions, assign mastery percentages, hide remaining gaps, or ignore support usage.

## State and validation

The server-side session engine defines the authoritative lifecycle transitions. Zustand now acts as a client adapter for the latest server snapshot, pending UI actions, deterministic controls, and fallback-safe hydration. React Hook Form coordinates workspace forms with shared Zod schemas. Environment variables, education records, session requests, path params, and API bodies are validated at their boundary.

## Operational foundation

API handlers use consistent success/error envelopes with request metadata. The logger emits structured records behind a replaceable interface. Vitest covers isolated logic, fallback meaning, education dataset invariants, session transitions, idempotency, and guarded writes. Playwright uses the production server with bounded worker concurrency to verify routes, navigation, responsive layout, fallbacks, hydration behavior, API-created sessions, refresh/resume, reports, and the dataset explorer.

Error reporting transport, analytics transport, rate limiting, production telemetry, durable learning sessions, judge-mode polish, and real benchmark evaluation are planned but not implemented.

## Step 10 judge and submission layer

Judge Mode lives at `/demo/judge` and uses a deterministic scene system in
`src/lib/judge-demo`. It is intentionally separate from the persisted
educational session stages so the competition demo can remain reliable when
OpenAI, PostgreSQL, WebGL, or animation timing are unavailable.

Each judge scene records its execution source: `live_openai`, `deterministic`,
`cached_demo`, or `fallback`. Cached reviewed responses are labeled as cached
and are used only for guided/fallback demonstration paths. They do not overwrite
real session evidence.

The readiness endpoint reports safe configuration status without exposing
secrets. The final submission documentation explains which integrations are
implemented, which are deterministic/mock verified, and which require live
credentials.
