# WanderMind (ai-real-challenge)

AI-powered tourism discovery for India: personalized destinations, hidden gems, RAG-grounded itineraries, immersive stories, cultural events, and local hosts — using Next.js, PostgreSQL, embeddings, and multi-provider LLMs.

## Problem statement

Travelers need **personalized, trustworthy** trip ideas—not generic lists. WanderMind combines **retrieval** (local database, Wikipedia, Wikivoyage, vector search) with **LLM synthesis**, and shows **which source** supports each section of the plan.

## Features

- **Grounded recommendations** — `/api/rag/recommend` + Trivago-style UI
- **Hidden gems & events** — semantic search + catalog
- **Stories** — style-based narratives with source attribution
- **Local hosts** — match by destination and interests
- **Multi-provider AI** — OpenAI, Anthropic, Google, OpenRouter via `AI_PROVIDER`

## Development

```bash
cp .env.example .env   # then set DATABASE_URL and API keys
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Quality checklist

See **[docs/HACKATHON_READINESS.md](./docs/HACKATHON_READINESS.md)** for judges’ criteria.

**Full verification (target 100/100 rubric):**

```bash
npm test              # 50+ unit/API tests
npm run test:e2e      # Playwright smoke (home, /quality, a11y focus)
npm run typecheck
npm run lint
npm run build
npm run db:check      # with .env
```

Docs: [ARCHITECTURE.md](./docs/ARCHITECTURE.md) · [SECURITY.md](./docs/SECURITY.md) · [PROBLEM_STATEMENT_ALIGNMENT.md](./docs/PROBLEM_STATEMENT_ALIGNMENT.md) · UI scorecard at **`/quality`**

## Architecture (short)

| Layer | Path |
|-------|------|
| UI | `features/discovery/` |
| API | `app/api/` |
| RAG | `services/rag/`, `services/knowledge/` |
| LLM | `services/llm/orchestrator.ts` |
| Data | `prisma/`, `lib/db/postgres.ts` |

## License

See [LICENSE](./LICENSE).
