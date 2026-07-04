import { NextResponse } from "next/server";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { ragUserProfileSchema } from "@/lib/schemas/rag";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(request, ragUserProfileSchema, "Invalid profile");
  if (!validated.ok) return validated.response;

  try {
    const data = await ragOrchestratorService.recommend(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(
      clientSafeErrorMessage(error, "RAG recommendation failed"),
      502,
    );
  }
}
