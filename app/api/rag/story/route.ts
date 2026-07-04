import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/lib/api";
import { ragStoryRequestSchema } from "@/lib/schemas/rag";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = ragStoryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid story request", 400, parsed.error.flatten());
  }

  try {
    const data = await ragOrchestratorService.generateStory(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "RAG story failed";
    return jsonError(message, 502);
  }
}
