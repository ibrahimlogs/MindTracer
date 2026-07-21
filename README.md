# MindTrace Reasoning Lab

> Same answer. Different minds.

MindTrace Reasoning Lab is a competition-grade AI learning prototype focused on one educational problem: two learners can give the same wrong answer for completely different reasons.

Most learning software notices the answer is wrong. MindTrace is designed to investigate the reasoning behind the answer. It forms misconception hypotheses, verifies them with targeted questions, gives the smallest useful intervention, and checks whether the learner can transfer the concept independently.

This repository is intentionally not a finished commercial product yet. It is a working technical and product foundation with a polished judge demo, deterministic learning workflow, sample educational data, safety boundaries, evaluation checks, and the architecture needed for future OpenAI-powered reasoning analysis.

## Submission status

Recommended judging route:

```text
/demo/judge
```

Other useful review routes:

```text
/
/demo
/demo/session/example-session
/report/example-session
/technology
/technology/dataset
/technology/evaluation
```

Current build status:

- Public pages render without database credentials.
- Judge Mode works without OpenAI or database secrets.
- The learner demo can run with explicit in-memory fallback mode.
- Production build passes.
- Unit and browser tests are included.
- OpenAI integration exists as a server-only, lazy placeholder/adapter boundary.
- PostgreSQL persistence is scaffolded through Prisma, but a live database is not required to review the public demo path.

## What judges should look at first

1. Open `/demo/judge`.
2. Click **Begin** to watch the guided explanation.
3. Notice that both learners share the same wrong answer, but the system shows different reasoning paths.
4. Continue through hypothesis, verification, intervention, retry, reasoning delta, and transfer.
5. Open `/technology/dataset` to inspect the curated sample educational records.
6. Open `/technology/evaluation` to see the prototype behavior checks.

The value of the project is not “another quiz app.” The value is the product model: diagnosis is treated as a verified hypothesis, and support is selected based on reasoning evidence rather than correctness alone.

## Tech stack

- Next.js App Router
- React
- TypeScript with strict mode
- Tailwind CSS v4
- shadcn/ui foundations
- Framer Motion
- React Three Fiber, Drei, and Three.js for optional visual enhancement
- Zustand
- React Hook Form
- Zod
- Prisma
- PostgreSQL-compatible database support
- OpenAI SDK server-only adapter boundary
- Lucide icons
- Vitest
- Testing Library
- Playwright
- ESLint
- Prettier
- pnpm

## Requirements

- Node.js 20.9 or newer
- Corepack
- pnpm through Corepack

Optional for full backend persistence:

- PostgreSQL-compatible database
- `DATABASE_URL`

Optional for live OpenAI smoke tests:

- `OPENAI_API_KEY`

For normal judge review of the public pages and Judge Mode, database and OpenAI secrets are not required.

## Installation

Clone the repository, then run:

```bash
corepack enable
corepack pnpm install
corepack pnpm prisma:generate
```

If `corepack enable` cannot create a global shim on your machine, keep using the `corepack pnpm ...` form shown above.

## Environment setup

Create a local environment file only if you want to test backend integrations:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Example environment values:

```dotenv
DATABASE_URL=
OPENAI_API_KEY=
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

Important security notes:

- Do not put real API keys in client-side variables.
- Only variables prefixed with `NEXT_PUBLIC_` can be exposed to the browser.
- `OPENAI_API_KEY` is server-only.
- Environment validation uses Zod.
- Server integrations are validated lazily when requested, so public pages can render without secrets.

## Running the project

Start the development server:

```bash
corepack pnpm dev
```

Open:

```text
http://localhost:3000
```

Best demo route:

```text
http://localhost:3000/demo/judge
```

Production build:

```bash
corepack pnpm build
corepack pnpm start
```

## Main routes

| Route                           | Purpose                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| `/`                             | Landing page explaining the product idea and value proposition            |
| `/demo/judge`                   | Recommended judge demo: same wrong answer, different reasoning paths      |
| `/demo`                         | Learner-facing demo entry                                                 |
| `/demo/session/example-session` | Example learning workspace                                                |
| `/report/example-session`       | Example final reasoning report                                            |
| `/technology`                   | Technical and educational architecture overview                           |
| `/technology/dataset`           | Curated sample concepts, problems, misconceptions, and evaluation records |
| `/technology/evaluation`        | Prototype behavior and regression checks                                  |

## Development commands

```bash
corepack pnpm dev                      # start local development server
corepack pnpm build                    # create production build
corepack pnpm start                    # serve production build
corepack pnpm lint                     # run ESLint
corepack pnpm typecheck                # run strict TypeScript checks
corepack pnpm format                   # format repository
corepack pnpm format:check             # check formatting
corepack pnpm validate:education       # validate curated education dataset
corepack pnpm prisma:generate          # generate Prisma client
corepack pnpm prisma:seed              # seed educational data when DATABASE_URL is set
corepack pnpm prisma:studio            # inspect configured database
corepack pnpm sessions:cleanup         # dry-run expired anonymous session cleanup
```

## Test commands

```bash
corepack pnpm test                     # run unit tests
corepack pnpm test:watch               # run unit tests in watch mode
corepack pnpm test:e2e:install         # install Playwright Chromium once
corepack pnpm test:e2e                 # run browser and route checks
```

Optional integration smoke tests:

```bash
corepack pnpm test:openai:smoke
corepack pnpm test:openai:ranking-smoke
corepack pnpm test:openai:verification-smoke
corepack pnpm test:openai:intervention-smoke
corepack pnpm test:openai:delta-smoke
corepack pnpm test:openai:transfer-smoke
corepack pnpm test:openai:journey-smoke
corepack pnpm test:postgres:smoke
```

The OpenAI smoke tests skip safely without an API key. The PostgreSQL smoke test is guarded and should only be run against a safe test database.

## Current implementation

Implemented:

- Premium learner-first landing page
- Judge Mode guided demo
- Interactive prototype label for manual Judge Mode exploration
- Demo session workspace
- Anonymous session API foundation
- Generated session URLs
- Refresh/resume fallback behavior
- Curated educational sample dataset
- Concept, problem, misconception, rubric, and evaluation records
- Dataset validation
- Deterministic reasoning extraction boundary
- Misconception candidate retrieval and ranking boundary
- Verification question selection and response evaluation boundary
- Adaptive bounded intervention selection boundary
- Retry analysis
- Reasoning Delta comparison
- Transfer selection and evaluation
- Evidence-based final report route
- Health and readiness endpoints
- Reduced-motion and WebGL fallback checks
- Hydration regression coverage for Judge Mode restored browser state
- Server-only lazy OpenAI adapter boundary
- Prisma/PostgreSQL persistence foundation

Not implemented yet:

- Authentication
- Payment
- Production deployment
- Real classroom account management
- Teacher dashboard
- Full production analytics
- Broad benchmark claims
- Fully live AI workflow for all product paths
- Long-term learner history
- Real school data import

## Why the project is incomplete by design

MindTrace is being built in phases. The current phase proves the foundation:

- Can the product explain the reasoning-diagnosis idea clearly?
- Can the app run without secrets for judging?
- Are the educational records structured and validated?
- Are AI boundaries server-only and testable?
- Can deterministic fallbacks make the demo reliable?
- Can the system show a full diagnosis-to-transfer journey before production AI is fully enabled?

The answer is yes. The next phase should deepen the visual product experience and connect more of the workflow to live model-backed reasoning where appropriate.

## How Codex and GPT-5.6 accelerated the work

Codex with GPT-5.6 was used as the primary engineering collaborator throughout the build. It accelerated:

- Next.js, TypeScript, Tailwind, Prisma, testing, and folder architecture setup
- Product architecture decisions around reasoning hypotheses, verification, intervention, retry, delta, and transfer
- Judge Mode implementation and demo reliability
- Deterministic fallback design so judges can test without secrets
- Educational data modeling and validation
- Unit and Playwright test coverage
- Hydration issue diagnosis and fix on `/demo/judge`
- Documentation, architecture notes, security boundaries, and known limitations

Key decisions made with Codex:

- Keep OpenAI usage server-only and lazy.
- Avoid requiring a database to render public pages.
- Use deterministic fallbacks for reviewability.
- Treat AI output as a proposal, not unquestioned truth.
- Make transfer evidence part of the learning loop.
- Keep incomplete features clearly labeled rather than pretending the product is production-finished.

## Architecture notes

High-level flow:

```text
Learner answer
  → reasoning evidence
  → misconception hypotheses
  → targeted verification
  → smallest useful intervention
  → retry
  → reasoning delta
  → independent transfer
  → report
```

The current implementation keeps the AI workflow bounded behind adapter interfaces. Deterministic implementations make the demo stable and testable; model-backed adapters can be enabled later where live reasoning is needed.

Useful architecture documents:

- `ARCHITECTURE.md`
- `LEARNING_WORKSPACE.md`
- `EDUCATIONAL_DATASET.md`
- `SESSION_ENGINE.md`
- `API_CONTRACTS.md`
- `DATABASE.md`
- `OPENAI_REASONING_ANALYSIS.md`
- `MISCONCEPTION_ENGINE.md`
- `VERIFICATION_ENGINE.md`
- `INTERVENTION_ENGINE.md`
- `REASONING_DELTA.md`
- `TRANSFER_SYSTEM.md`
- `KNOWN_LIMITATIONS.md`

## Data and privacy

- The repository uses curated sample education data.
- Do not submit personal learner data to smoke tests.
- OpenAI responses are not stored by default.
- API keys are never exposed as `NEXT_PUBLIC_` variables.
- The project is currently designed for prototype review, not production student deployment.

## Troubleshooting

If port `3000` is already in use, stop the existing process or run Next.js on another port:

```bash
corepack pnpm dev -- -p 3001
```

If Prisma client is missing:

```bash
corepack pnpm prisma:generate
```

If Playwright browsers are missing:

```bash
corepack pnpm test:e2e:install
```

If environment secrets are not configured, review these routes first:

```text
/
/demo/judge
/demo
/technology
/technology/dataset
/technology/evaluation
```

## Recommended next step

The exact next recommended step is the visual product phase: refine the learner-facing experience, improve the interactive reasoning visualization, and decide which currently deterministic adapters should be connected to live OpenAI reasoning first.

## License

No open-source license has been selected yet. Add a license before making the repository public for judging.
