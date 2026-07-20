# Deployment

Recommended target: Vercel for Next.js with Neon or Supabase PostgreSQL.

Required production environment variables:

- `APP_ENV=production`
- `NEXT_PUBLIC_APP_URL`
- `DEMO_MODE`
- `JUDGE_MODE`
- `ALLOW_CACHED_JUDGE_FALLBACK`
- `DATABASE_URL` when persistent sessions are required
- `OPENAI_API_KEY` when live AI is enabled

Validate before release:

1. `corepack pnpm build`
2. `corepack pnpm test:e2e`
3. `/api/health`
4. `/api/readiness`
5. `/demo/judge`

Do not run destructive database resets against production.
