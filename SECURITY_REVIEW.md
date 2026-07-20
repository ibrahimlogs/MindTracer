# Security Review

## Reviewed controls

- API payloads use Zod validation.
- Session creation has a lightweight in-memory rate limit for development and a production-compatible abstraction point.
- OpenAI initialization is server-only and lazy.
- Health and readiness endpoints do not expose secrets.
- Cached judge responses are explicitly labeled and do not overwrite real session evidence.
- Environment validation distinguishes development, test, and production modes.

## Remaining hardening before public production use

- Replace in-memory rate limits with durable edge or database-backed limits.
- Configure deployment response headers and CSP for the final host.
- Run dependency audit in the chosen CI environment.
- Run live PostgreSQL smoke checks only against a confirmed safe test database.
- Avoid raw learner-response logging in production observability.
