# MindTrace Reasoning Lab

> Same answer. Different minds.

Screenshot placeholder: add a final Judge Mode screenshot before public submission.

Live demo placeholder: add the deployed URL after Vercel deployment.

Demo video placeholder: add the recorded walkthrough URL after submission recording.

MindTrace Reasoning Lab is an AI learning product designed to distinguish the different reasoning patterns that can produce the same wrong answer. The system forms misconception hypotheses, verifies them with targeted questions, provides the smallest useful intervention, and tests independent transfer.

The key innovation is treating diagnosis as a verified hypothesis: the AI proposes and adapts, while the learning system governs IDs, verification, hint levels, answer-leakage checks, rubrics, and transfer.

Quick start:

```bash
corepack pnpm install
corepack pnpm dev
```

Then open `/demo/judge`.

## Tech stack

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS v4 and shadcn/ui foundations
- Framer Motion and a semantic reduced-motion system
- React Three Fiber, Drei, and Three.js for the optional hero enhancement
- Zustand, React Hook Form, and Zod
- Prisma with a PostgreSQL-compatible datasource
- Server-only, lazy OpenAI SDK placeholder
- Lucide icons
- Vitest, Testing Library, and Playwright
- ESLint and Prettier

## Installation

Requirements: Node.js 20.9 or newer. PostgreSQL is required for durable session persistence; public pages and explicit demo fallback mode do not require a live database.

```bash
corepack enable
pnpm install
pnpm prisma:generate
```

If Corepack cannot create a global shim, prefix commands with `corepack`, for example `corepack pnpm install`.

## Environment setup

Copy `.env.example` to `.env.local` when working on server integrations:

```dotenv
DATABASE_URL=
OPENAI_API_KEY=your-server-only-key
APP_ENV=development
OPENAI_REASONING_MODEL=gpt-5.6
OPENAI_REASONING_TIMEOUT_MS=12000
OPENAI_REASONING_MAX_RETRIES=1
OPENAI_STORE_RESPONSES=false
REASONING_ANALYZER_MODE=deterministic
MISCONCEPTION_RANKER_MODE=deterministic
VERIFICATION_ADAPTER_MODE=deterministic
VERIFICATION_EVALUATOR_MODE=deterministic
INTERVENTION_SELECTOR_MODE=deterministic
INTERVENTION_ADAPTER_MODE=deterministic
REASONING_DELTA_MODE=deterministic
TRANSFER_EVALUATOR_MODE=deterministic
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_MODE=true
JUDGE_MODE=true
ALLOW_CACHED_JUDGE_FALLBACK=true
ALLOW_IN_MEMORY_SESSION_FALLBACK=true
```

Server variables are validated lazily when the database or AI client is requested. The landing, demo teaser, technology page, tests, production build, and explicit in-memory fallback sessions work without secrets. `OPENAI_API_KEY` is never exposed through a `NEXT_PUBLIC_` variable.

## Development commands

```bash
pnpm dev                 # start the development server
pnpm build               # create a production build
pnpm start               # serve the production build
pnpm lint                # lint source and configuration files
pnpm typecheck           # run strict TypeScript checks
pnpm validate:education  # validate the curated education dataset
pnpm prisma:seed         # seed educational records when DATABASE_URL is set
pnpm sessions:cleanup    # dry-run expired anonymous session cleanup
pnpm evaluate:reasoning  # run prototype reasoning-extraction evaluation
pnpm evaluate:verification # run prototype verification evaluation
pnpm evaluate:intervention # run prototype intervention-selection evaluation
pnpm evaluate:reasoning-delta # run prototype Reasoning Delta evaluation
pnpm evaluate:transfer # run prototype transfer evaluation
pnpm test:openai:journey-smoke # optional full journey smoke test; skips without key
pnpm test:postgres:smoke # optional live PostgreSQL smoke; requires SAFE_TEST_DATABASE=true
pnpm format              # format the repository
pnpm format:check        # verify formatting
pnpm prisma:migrate      # create/apply a future development migration
pnpm prisma:studio       # inspect a configured database
```

## Test commands

```bash
pnpm test                # run unit tests once
pnpm test:watch          # run unit tests in watch mode
pnpm test:e2e:install    # install Chromium once
pnpm build               # required before the production E2E server
pnpm test:e2e            # run browser, accessibility, fallback, and route checks
pnpm test:openai:smoke   # optional live OpenAI smoke test; skips without key
pnpm test:openai:ranking-smoke      # optional live ranking smoke test; skips without key
pnpm test:openai:verification-smoke # optional live verification smoke test; skips without key
pnpm test:openai:intervention-smoke # optional live intervention smoke test; skips without key
pnpm test:openai:delta-smoke        # optional live Delta smoke test; skips without key
pnpm test:openai:transfer-smoke     # optional live transfer smoke test; skips without key
pnpm test:openai:journey-smoke      # optional live journey smoke test; skips without key
pnpm test:postgres:smoke            # optional PostgreSQL smoke test; guarded
```

The Playwright suite verifies critical routes, landing sections, CTA targets, anchor navigation, native mobile navigation, reduced-motion and WebGL fallbacks, hydration warnings, common mobile/tablet overflow, the API-created Learning Workspace journey, generated session URLs, refresh/resume behavior, and the development dataset explorer.

## Current scope

Implemented: technical foundation, design system, public landing page, optional reasoning visualization, technology positioning, demo selector, Judge Mode, Learning Workspace, anonymous session APIs, generated session URLs, refresh/resume fallback behavior, structured reasoning extraction, misconception candidate retrieval/ranking, verification question selection/response evaluation, adaptive bounded interventions, retry analysis, Reasoning Delta, transfer selection/evaluation, animated intervention and delta visualizers, evidence-based final reports, health/readiness endpoints, and prototype curated educational dataset.

Not implemented: authentication, payments, production analytics, real benchmark calculations, deployment, or demo-video recording.

See `LEARNING_WORKSPACE.md` for the Step 3 architecture and mocked journey details.
See `EDUCATIONAL_DATASET.md` for the Step 4 dataset structure, validation rules, and review workflow.
See `SESSION_ENGINE.md`, `API_CONTRACTS.md`, and `DATABASE.md` for the Step 5 session, API, and persistence foundation.
See `OPENAI_REASONING_ANALYSIS.md`, `REASONING_EVALUATION.md`, and `AI_PRIVACY.md` for the Step 6 reasoning extraction boundary.
See `MISCONCEPTION_ENGINE.md`, `VERIFICATION_ENGINE.md`, and `VERIFICATION_EVALUATION.md` for the Step 7 ranking and verification boundary.
See `INTERVENTION_ENGINE.md`, `VISUALIZATION_SYSTEM.md`, and `INTERVENTION_EVALUATION.md` for the Step 8 adaptive support boundary.
See `REASONING_DELTA.md`, `TRANSFER_SYSTEM.md`, `REASONING_DELTA_EVALUATION.md`, and `TRANSFER_EVALUATION.md` for the Step 9 retry, delta, transfer, and reporting boundary.
See `JUDGE_GUIDE.md`, `SUBMISSION.md`, `DEMO_SCRIPT.md`, `SECURITY_REVIEW.md`, `DEPLOYMENT.md`, and `KNOWN_LIMITATIONS.md` for the Step 10 submission package.
See `VISUAL_REDESIGN.md` for the learner-first visual and UX refinement.

## Judge Mode

`/demo/judge` is the recommended submission path. Guided Mode uses scripted learner responses and reviewed cached fallback so the demo remains reviewable without environment secrets. Interactive Mode is prototype-labeled and restricted to curated problems.

## Evaluation and limitations

`/technology/evaluation` presents prototype system-behavior checks. These deterministic and handcrafted evaluations are regression and safety checks, not claims of broad educational efficacy.

## Privacy

OpenAI API keys are server-only. Do not submit personal learner data to smoke tests. See `AI_PRIVACY.md`.

## License

No open-source license has been selected yet. See `LICENSE`.
