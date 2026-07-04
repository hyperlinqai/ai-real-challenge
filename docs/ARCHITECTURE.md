# Architecture — WanderMind

## Overview

WanderMind is a **retrieval-augmented** tourism app for India. The UI collects a traveler profile, API routes validate input with **Zod**, services orchestrate **Postgres + external knowledge + LLM**, and responses are structured JSON with **source attribution**.

```
Browser (features/discovery)
    → app/api/* (validation, rate limit via middleware)
        → services/* (domain logic)
            → lib/* (schemas, DB, utilities)
                → PostgreSQL / Wikipedia / Wikivoyage / LLM APIs
```

## Modules

| Module | Responsibility |
|--------|----------------|
| `features/discovery/` | Trip planner UI, results, gallery, story |
| `services/rag/` | RAG recommend + story orchestration |
| `services/knowledge/` | Provider interface, Wikipedia, local DB |
| `services/vector/` | Embedding search (Float[] + cosine) |
| `services/llm/` | Multi-provider AI SDK wrapper |
| `lib/schemas/` | Zod contracts shared by API + LLM output |
| `lib/api.ts` | `parseAndValidateBody`, `createPostJsonHandler` |
| `middleware.ts` | API rate limiting |

## Data

- **Prisma** models: destinations, attractions, events, hosts, cache, knowledge documents.
- **Embeddings**: stored as `Float[]` when pgvector is unavailable.
- **Fallback catalog**: in-memory seed when DB is down (demo resilience).

## Quality gates

- `npm test` — unit + API handler tests  
- `npm run test:e2e` — Playwright smoke  
- `npm run typecheck` / `lint` / `build`  
- CI: `.github/workflows/ci.yml`

See also: [PROBLEM_STATEMENT_ALIGNMENT.md](./PROBLEM_STATEMENT_ALIGNMENT.md), [SECURITY.md](./SECURITY.md).
