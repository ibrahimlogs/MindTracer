# Planned architecture

MindTrace is organized around a staged reasoning lifecycle while keeping model calls behind server boundaries. The current code establishes the technical and visual foundations; it does not claim that the learning workflow exists.

## Application layer

`src/app` uses the Next.js App Router. Public product positioning lives at `/`, `/demo`, and `/technology`. The static Learning Workspace lives at `/demo/session/[sessionId]`, the mocked Reasoning Delta report lives at `/report/[sessionId]`, and the development dataset explorer lives at `/technology/dataset`. Route loading states, a recoverable error boundary, and the `/api/health` response envelope remain intact.

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

Domain services are planned under `src/lib/misconception`, `intervention`, and `analytics`. Prisma is configured for PostgreSQL, but no product models exist yet.

## AI boundary

`src/lib/ai` exposes a lazy, server-only OpenAI client placeholder. Future model calls must return schema-validated structured output behind server boundaries. Hypotheses must remain labeled as inference, while observations and learner-provided evidence remain distinct. No prompt or reasoning workflow exists yet.

## State and validation

Zustand manages the mocked learning-session state machine for Step 3. Durable session state will eventually belong in PostgreSQL. React Hook Form coordinates workspace forms with shared Zod schemas. Environment variables, education records, and future request payloads are validated at their boundary.

## Operational foundation

API handlers use consistent success/error envelopes. The logger emits structured records behind a replaceable interface. Vitest covers isolated logic, fallback meaning, and education dataset invariants. Playwright uses the production server with bounded worker concurrency to verify routes, navigation, responsive layout, fallbacks, hydration behavior, the static workspace, reports, and the dataset explorer.

Error reporting transport, analytics transport, rate limiting, production telemetry, durable learning sessions, live misconception logic, and real evaluation logic are planned but not implemented.
