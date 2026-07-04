import { createPostJsonHandler } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

export const runtime = "nodejs";

export const POST = createPostJsonHandler({
  schema: ragUserProfileSchema,
  invalidLabel: "Invalid profile",
  fallbackError: "RAG recommendation failed",
  handler: async (data) => ragOrchestratorService.recommend(data),
});
