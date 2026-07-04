# Hackathon readiness — WanderMind

Use this matrix when demoing or submitting. Status reflects the current codebase.

## Problem statement alignment

| Requirement (README / brief) | Implementation | Where to demo |
|------------------------------|----------------|---------------|
| Personalized destinations | RAG itinerary from user profile + retrieval | Home → **Build grounded itinerary** |
| Hidden gems | Vector + keyword search, `hiddenGem` attractions | Results → **Hidden Gems** section; `/api/rag/hidden-gems` |
| Immersive storytelling | RAG story with style + sources | **AI story (RAG-grounded)** block |
| Cultural events | Events service + DB seed | Results → **Events**; `/api/events` |
| Local hosts | Host matching by destination + interests | `/api/hosts`, `/api/rag/hosts` |
| LLMs + multi-provider | OpenAI, Anthropic, Google, OpenRouter | `services/llm/orchestrator.ts`, `.env` `AI_PROVIDER` |
| PostgreSQL + knowledge | Prisma models, migrations, seed, ingest | `npm run db:seed`, `npm run db:ingest` |
| Semantic / vector search | Embeddings + cosine similarity on `Float[]` | `services/vector/vector-search.service.ts` |
| Source transparency | Per-section source badges | `RagResultsPanel` |

**Gap:** README still mentions pgvector; production DB uses **Float[] + in-app cosine** when pgvector is unavailable. Say that explicitly in the pitch.

---

## Code quality

| Area | Status | Notes |
|------|--------|--------|
| Layering | Strong | Shared `createPostJsonHandler` / `createGetJsonHandler`; see `docs/ARCHITECTURE.md` |
| Validation | Strong | Zod on API inputs; shared `parseAndValidateBody` |
| Types | Good | Shared `types/`, generated Prisma client |
| Consistency | Good | Feature module `features/discovery/` |
| Lint | Present | `npm run lint` (ESLint + Next config) |

**Improve later:** API route integration tests with mocked LLM; split very large UI component if it grows further.

---

## Security

| Area | Status | Notes |
|------|--------|--------|
| Secrets in env | Good | `.env` gitignored; keys only server-side |
| Input validation | Good | Zod on POST bodies; GET search params validated |
| Error leakage | Improved | `clientSafeErrorMessage` hides stack/details in production |
| Auth / rate limit | Gap | Public API — add auth or edge rate limiting before production |
| SSRF | Low risk | Wikipedia/Wikivoyage use fixed base URLs |
| SQL injection | Good | Prisma parameterized queries |

**Before public launch:** rate limits, optional API key, CORS policy, audit logging for LLM spend.

---

## Efficiency

| Area | Status | Notes |
|------|--------|--------|
| AI caching | Good | `CachedAiResponse` + wiki cache |
| DB fallback | Good | In-memory catalog when DB down |
| Provider timeouts | Good | `safeProviderCall` + 8s timeout |
| LLM retries | Good | Transient errors in orchestrator |
| Vector search | OK | Loads up to 200 docs then scores in memory — fine for hackathon scale |
| Embeddings | Cost-aware | Optional without API key on ingest |

**Improve later:** pagination on vector search; background ingest queue.

---

## Testing

| Area | Status | Notes |
|------|--------|--------|
| Unit tests | **Expanded** | `npm test` — schemas, API route, knowledge, context builder, utilities (35+ cases) |
| CI | **Added** | `.github/workflows/ci.yml` — test, lint, build |
| E2E / UI | Gap | No Playwright yet |
| Coverage | Optional | `npm run test:coverage` |

**Demo command:** `npm test && npm run lint && npm run build`

**Scorecard:** [`/quality`](/quality) for judges

---

## Accessibility

| Area | Status | Notes |
|------|--------|--------|
| Labels | Improved | Form fields tied with `htmlFor` / `id` |
| Keyboard | Good | Native inputs, buttons, selects (Base UI) |
| Focus | Good | `focus-visible` rings on buttons |
| Loading / results | Improved | `aria-live` regions for status |
| Motion | Note | Framer Motion on hero — respect `prefers-reduced-motion` if extended |
| Color contrast | Good | Primary blue on white; check saffron CTA in audit tool |

**Manual check:** Tab through search form → submit → verify screen reader announces loading and results.

---

## Quick verifier script

```bash
npm test
npm run lint
npm run build
npm run db:check   # needs .env
```

---

## Suggested 2-minute judge narrative

1. **Problem:** Generic travel sites don’t personalize India trips or cite sources.
2. **Approach:** Retrieve from local DB + Wikipedia + Wikivoyage → RAG prompt → structured itinerary with source badges.
3. **Tech:** Next.js 15, Prisma/Postgres, multi-LLM, embeddings without mandatory pgvector.
4. **Quality:** Validated APIs, unit tests, accessibility on the main flow, cached AI responses.
