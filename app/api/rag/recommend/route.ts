import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = ragUserProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid profile", 400, parsed.error.flatten());
  }

  try {
    const data = await ragOrchestratorService.recommend(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "RAG recommendation failed";
    return jsonError(message, 502);
  }
}
