import {
  recommendationResponseSchema,
  type TravelPreferencesInput,
} from "@/lib/schemas/recommendations";
import { destinationRecommendationPrompt } from "@/prompts";
import { aiCacheService } from "@/services/cache/ai-cache.service";
import { databaseService } from "@/services/database/database.service";
import { llmOrchestrator } from "@/services/llm/orchestrator";
import { isDatabaseAvailable } from "@/lib/prisma";

export class RecommendationEngineService {
  async recommend(preferences: TravelPreferencesInput) {
    const catalog = await databaseService.getDestinationCatalog();
    const preferencesJson = JSON.stringify(preferences);
    const catalogJson = JSON.stringify(catalog);
    const prompt = destinationRecommendationPrompt({ catalogJson, preferencesJson });

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) {
        return recommendationResponseSchema.parse(cached);
      }
    }

    const result = await llmOrchestrator.generateJson(recommendationResponseSchema, prompt);

    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, result).catch(() => undefined);
    }

    return result;
  }
}

export const recommendationEngineService = new RecommendationEngineService();
