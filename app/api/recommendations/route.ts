import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/lib/api";
import { travelPreferencesSchema } from "@/lib/schemas/recommendations";
import { recommendationEngineService } from "@/services/recommendation/recommendation-engine.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request);
  const parsed = travelPreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid travel preferences", 400, parsed.error.flatten());
  }

  try {
    const data = await recommendationEngineService.recommend(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recommendation failed";
    return jsonError(message, 502);
  }
}
