# Security practices — WanderMind

- **Secrets:** API keys and `DATABASE_URL` only in `.env` (gitignored). Use `.env.example` as a template.
- **Input validation:** All POST APIs use Zod via `parseAndValidateBody`; GET search uses `knowledgeSearchQuerySchema`.
- **Error handling:** `clientSafeErrorMessage` hides internal errors in production (502 responses).
- **Rate limiting:** `middleware.ts` limits `/api/*` per IP (configurable via `API_RATE_LIMIT_PER_MINUTE`, default 120/min).
- **HTTP headers:** `next.config.ts` sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Database:** Prisma parameterized queries; no user-controlled SQL.
- **External fetch:** Wikipedia/Wikivoyage use fixed MediaWiki base URLs only.

**Before public launch:** Add authentication for admin routes, WAF/CDN rate limits, and secret rotation.
