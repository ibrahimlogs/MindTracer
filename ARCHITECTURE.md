# Planned architecture

MindTrace is organized around a staged reasoning lifecycle while keeping model calls behind server boundaries. The current code establishes the technical and visual foundations; it does not claim that the learning workflow exists.

## Application layer

`src/app` uses the Next.js App Router. Public product positioning lives at `/`, `/demo`, and `/technology`. Session and report placeholders remain at `/demo/session/[sessionId]` and `/report/[sessionId]`. Route loading states, a recoverable error boundary, and the `/api/health` response envelope remain intact.

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

Static, reviewed fixtures remain separated into concepts, problems, misconceptions, and evaluation data. Domain services are planned under `src/lib/misconception`, `intervention`, and `analytics`. Prisma is configured for PostgreSQL, but no product models exist yet.

Step 3 will build a deterministic static learning workspace and mocked reasoning journey before persistence or model behavior is introduced.

## AI boundary

`src/lib/ai` exposes a lazy, server-only OpenAI client placeholder. Future model calls must return schema-validated structured output behind server boundaries. Hypotheses must remain labeled as inference, while observations and learner-provided evidence remain distinct. No prompt or reasoning workflow exists yet.

## State and validation

Zustand is reserved for ephemeral interaction state. Durable session state will eventually belong in PostgreSQL. React Hook Form will coordinate forms with shared Zod schemas. Environment variables and future request payloads are validated at their boundary.

## Operational foundation

API handlers use consistent success/error envelopes. The logger emits structured records behind a replaceable interface. Vitest covers isolated logic and fallback meaning. Playwright uses the production server with bounded worker concurrency to verify routes, navigation, responsive layout, fallbacks, and hydration behavior.

Error reporting transport, analytics transport, rate limiting, production telemetry, the learning workflow, and evaluation logic are planned but not implemented.
