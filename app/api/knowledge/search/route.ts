import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { knowledgeService } from "@/services/knowledge/knowledge.service";
import { knowledgeSearchQuerySchema } from "@/lib/schemas/rag";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = knowledgeSearchQuerySchema.safeParse({
    q: searchParams.get("q"),
    destination: searchParams.get("destination") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("Invalid search query", 400, parsed.error.flatten());
  }

  const { results, errors } = await knowledgeService.searchAll({
    query: parsed.data.q,
    destination: parsed.data.destination,
    limitPerProvider: Math.ceil(parsed.data.limit / 3),
  });

  return NextResponse.json({
    results: results.slice(0, parsed.data.limit),
    errors,
  });
}
