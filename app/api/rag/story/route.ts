import { createPostJsonHandler } from "@/lib/api";
import { ragStoryRequestSchema } from "@/lib/schemas/rag";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

export const runtime = "nodejs";

export const POST = createPostJsonHandler({
  schema: ragStoryRequestSchema,
  invalidLabel: "Invalid story request",
  fallbackError: "RAG story failed",
  handler: async (data) => ragOrchestratorService.generateStory(data),
});
