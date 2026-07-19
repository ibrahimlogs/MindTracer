# Learning Workspace

Step 3 implements a complete static MindTrace learning journey with deterministic mocked data. It demonstrates the intended product behavior without OpenAI calls, persistence, authentication, payments, live misconception classification, or real benchmark calculations.

## Routes

- `/demo` presents the premium demo chooser.
- `/demo/session/demo-session?mode=compare` runs the guided two-learner comparison.
- `/demo/session/demo-session?mode=learner` allows typed prototype interaction mapped to mocked paths.
- `/demo/session/demo-session?mode=pipeline` exposes stage jumping for judges and technical review.
- `/report/demo-session` shows the static Reasoning Delta report.

## Workspace architecture

The workspace is driven by typed fixture data under `src/data/demo`, a Zustand store in `src/stores/learning-session-store.ts`, and reusable panels under `src/components/problem`, `src/components/visualization`, `src/components/mindtrace`, `src/components/reasoning`, and `src/components/demo`.

Desktop uses a three-panel layout: problem workspace, visual reasoning canvas, and structured MindTrace guide. Tablet and mobile collapse into a sequential flow with a compact stage indicator and no horizontal overflow.

## State machine

The mocked session uses the `LearningStage` union:

`problem_presented`, `initial_attempt`, `reasoning_analysis`, `hypothesis_ready`, `verification_required`, `verification_submitted`, `intervention_ready`, `intervention_shown`, `retry_required`, `retry_submitted`, `reasoning_delta`, `transfer_presented`, `transfer_submitted`, `session_complete`.

Adjacent transitions are validated for Previous and Next controls. Form submissions move to the next meaningful stage, pause auto-play, and preserve completed-stage evidence.

## Mock data structure

- `demo-problem.ts` contains the advertising and sales task.
- `demo-learners.ts` contains Learner A and Learner B explanations, hypotheses, verification prompts, interventions, revised explanations, and report copy.
- `demo-transfer.ts` contains the study-hours transfer task and deterministic answer evaluation.
- `demo-learning.ts` contains shared product types.

## Learner A flow

Learner A answers `10` after noticing the values increase. MindTrace preserves that observation, checks whether the learner used the repeated rate, verifies the `+2` sales change, then shows consecutive differences. The revised explanation uses two more `+2` steps to reach `11`.

## Learner B flow

Learner B answers `10` by assuming sales is exactly double advertising. MindTrace preserves the rate insight, checks the multiplication rule against the table, reveals the mismatch at advertising `2`, then bridges to `y = 2x + 1`. The revised explanation reaches `11`.

## Transfer flow

Both paths share a transfer task: study hours and score follow `+3` per hour. The mocked transfer result expects `64` and records evidence without fake mastery percentages.

## Simulated features

The reasoning analysis, hypotheses, verification questions, interventions, revised answers, transfer evidence, auto-play, and report are all deterministic prototype simulations. Future phases will replace these fixtures with reviewed datasets, then durable sessions, verified misconception logic, targeted interventions, and model-backed structured outputs.
