import { NextResponse } from "next/server";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { ragStoryRequestSchema } from "@/lib/schemas/rag";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(
    request,
    ragStoryRequestSchema,
    "Invalid story request",
  );
  if (!validated.ok) return validated.response;

  try {
    const data = await ragOrchestratorService.generateStory(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "RAG story failed"), 502);
  }
}
