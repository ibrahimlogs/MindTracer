# MindTrace Reasoning Lab

> Same answer. Different minds.

MindTrace Reasoning Lab is an AI learning product designed to identify why learners can arrive at the same wrong answer for different reasons. The planned system will form misconception hypotheses, verify them with targeted questions, give the smallest useful intervention, and test independent transfer. This repository currently contains the verified technical foundation, not the diagnostic product workflow.

## Tech stack

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS and shadcn/ui foundations
- Framer Motion, Zustand, React Hook Form, and Zod
- Prisma with a PostgreSQL-compatible datasource
- OpenAI SDK placeholder (server-only and lazily initialized)
- Lucide icons
- Vitest, Testing Library, and Playwright
- ESLint and Prettier

## Installation

Requirements: Node.js 20.9 or newer and a PostgreSQL-compatible database.

```bash
corepack enable
pnpm install
pnpm prisma:generate
```

If Corepack cannot create a global shim, prefix commands with `corepack`, for example `corepack pnpm install`.

## Environment setup

Copy `.env.example` to `.env.local` and provide server credentials:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/mindtrace
OPENAI_API_KEY=your-server-only-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_MODE=true
```

Server variables are validated lazily with Zod when a database or AI client is requested. This allows static pages and CI checks to run without credentials while preventing an integration from running with malformed configuration. `OPENAI_API_KEY` is never exposed through a `NEXT_PUBLIC_` variable.

## Development commands

```bash
pnpm dev                 # start the development server
pnpm build               # create a production build
pnpm start               # serve the production build
pnpm lint                # lint all source and configuration files
pnpm typecheck           # run strict TypeScript checks
pnpm format              # format the repository
pnpm format:check        # verify formatting
pnpm prisma:migrate      # create/apply a development migration
pnpm prisma:studio       # inspect the configured database
```

## Test commands

```bash
pnpm test                # run unit tests once
pnpm test:watch          # run unit tests in watch mode
pnpm test:e2e:install    # install Chromium once
pnpm test:e2e            # run browser route checks
```

No authentication, payment, production database models, or AI reasoning workflow is implemented in this foundation.
