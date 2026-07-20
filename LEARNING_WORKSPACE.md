# Learning Workspace

Step 3 implements a complete MindTrace learning journey with deterministic mocked data. Step 4 backs the shared educational content with a validated prototype dataset. Step 5 adds anonymous session APIs, generated session URLs, and refresh/resume hydration. The journey still runs without OpenAI calls, authentication, payments, live misconception classification, or real benchmark calculations.

## Routes

- `/demo` presents the premium demo chooser and starts anonymous sessions through the API.
- `/demo/session/demo-session?mode=compare` runs the guided two-learner comparison.
- `/demo/session/demo-session?mode=learner` allows typed prototype interaction mapped to mocked paths.
- `/demo/session/demo-session?mode=pipeline` exposes stage jumping for judges and technical review.
- `/demo/session/[generatedPublicId]?mode=compare` is the new generated-session URL shape.
- `/report/demo-session` shows the static Reasoning Delta report.

## Workspace architecture

The workspace is driven by typed learner scripts under `src/data/demo`, shared educational records under `src/data/education`, session APIs under `src/app/api/sessions`, a Zustand client adapter in `src/stores/learning-session-store.ts`, and reusable panels under `src/components/problem`, `src/components/visualization`, `src/components/mindtrace`, `src/components/reasoning`, and `src/components/demo`.

Desktop uses a three-panel layout: problem workspace, visual reasoning canvas, and structured MindTrace guide. Tablet and mobile collapse into a sequential flow with a compact stage indicator and no horizontal overflow.

## State machine

The mocked session uses the `LearningStage` union:

`problem_presented`, `initial_attempt`, `reasoning_analysis`, `hypothesis_ready`, `verification_required`, `verification_submitted`, `intervention_ready`, `intervention_shown`, `retry_required`, `retry_submitted`, `reasoning_delta`, `transfer_presented`, `transfer_submitted`, `session_complete`.

Server transitions are defined in `src/lib/session-engine/transitions.ts`. Form submissions call API endpoints when a generated session exists, then hydrate from the returned snapshot. Previous, pipeline jumps, and auto-play remain client demo controls and do not create new server facts by themselves.

## Mock data structure

- `demo-problem.ts` loads the Advertising and Sales task from the education problem dataset.
- `demo-learners.ts` keeps Learner A and Learner B scripted responses, while hypothesis labels, verification templates, interventions, rubrics, and misconception metadata resolve from the education dataset.
- `demo-transfer.ts` loads the Study Hours and Score transfer task from the education problem dataset and keeps deterministic answer evaluation.
- `demo-learning.ts` contains shared product types.

## Learner A flow

Learner A answers `10` after noticing the values increase. MindTrace preserves that observation, checks whether the learner used the repeated rate, verifies the `+2` sales change, then shows consecutive differences. The revised explanation uses two more `+2` steps to reach `11`.

## Learner B flow

Learner B answers `10` by assuming sales is exactly double advertising. MindTrace preserves the rate insight, checks the multiplication rule against the table, reveals the mismatch at advertising `2`, then bridges to `y = 2x + 1`. The revised explanation reaches `11`.

## Transfer flow

Both paths share a transfer task: study hours and score follow `+3` per hour. The mocked transfer result expects `64` and records evidence without fake mastery percentages.

## Simulated features

The reasoning analysis, hypotheses, revised answers, transfer evidence, auto-play, and report remain deterministic prototype simulations. Verification questions, shared interventions, rubrics, misconception labels, and transfer problem metadata come from the prototype curated education dataset. Step 5 stores session snapshots in explicit in-memory fallback when no database is configured; with PostgreSQL configured, the Prisma schema and seed path are ready for durable session records. Future phases will add OpenAI structured reasoning extraction, verified misconception logic, and model-backed structured outputs.
