import { createPostJsonHandler } from "@/lib/api";
import { travelPreferencesSchema } from "@/lib/schemas/recommendations";
import { recommendationEngineService } from "@/services/recommendation/recommendation-engine.service";

export const runtime = "nodejs";

export const POST = createPostJsonHandler({
  schema: travelPreferencesSchema,
  invalidLabel: "Invalid travel preferences",
  fallbackError: "Recommendation failed",
  handler: async (data) => recommendationEngineService.recommend(data),
});
