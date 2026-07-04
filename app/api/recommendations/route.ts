import { NextResponse } from "next/server";
import { clientSafeErrorMessage, jsonError, parseAndValidateBody } from "@/lib/api";
import { travelPreferencesSchema } from "@/lib/schemas/recommendations";
import { recommendationEngineService } from "@/services/recommendation/recommendation-engine.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const validated = await parseAndValidateBody(
    request,
    travelPreferencesSchema,
    "Invalid travel preferences",
  );
  if (!validated.ok) return validated.response;

  try {
    const data = await recommendationEngineService.recommend(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(clientSafeErrorMessage(error, "Recommendation failed"), 502);
  }
}
