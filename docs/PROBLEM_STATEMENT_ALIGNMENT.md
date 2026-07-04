# Problem statement alignment

Every hackathon requirement maps to shipped code and tests.

| Requirement | User-visible feature | Code / API | Automated test |
|-------------|---------------------|------------|----------------|
| Personalized destinations | Trip planner + itinerary | `POST /api/rag/recommend`, `travel-discovery.tsx` | `route.test.ts`, `e2e/smoke.spec.ts` |
| Hidden gems | Results tab + RAG section | `hidden-gems.service.ts`, `/api/rag/hidden-gems` | `schemas.test.ts` |
| Immersive stories | Story block + styles | `POST /api/rag/story` | `story/route.test.ts` |
| Cultural events | Events in RAG + DB seed | `events.service.ts`, `/api/events` | `schemas.test.ts`, `db:seed` |
| Local hosts | Host matching | `hosts.service.ts`, `/api/hosts` | `schemas.test.ts` |
| LLM multi-provider | Env `AI_PROVIDER` | `services/llm/orchestrator.ts` | Manual + integration via RAG routes |
| PostgreSQL data | Destinations, attractions | `prisma/`, `database.service.ts` | `destinations/route.test.ts`, `db:migrate` |
| Semantic search | Knowledge + embeddings | `vector-search.service.ts`, `/api/knowledge/search` | `knowledge/search/route.test.ts`, `cosine-similarity.test.ts` |
| Source transparency | Badges per section | `rag-results-panel.tsx` | E2E + manual |
| India / budget UX | ₹ budget, presets | `types/travel.ts`, UI form | `rag.test.ts` |

**Embeddings note:** Production uses PostgreSQL `Float[]` and in-app cosine similarity when pgvector is not installed; optional `CREATE EXTENSION vector` documented in migrations comment.

**Demo path (2 min):** Home → Jaipur card → Build itinerary → Gallery + tabs → Story → `/quality`.
