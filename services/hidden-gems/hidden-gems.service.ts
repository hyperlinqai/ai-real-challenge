import {
  hiddenGemsResponseSchema,
  type HiddenGemsRequest,
} from "@/lib/schemas/hidden-gems";
import { hiddenGemsEnrichmentPrompt } from "@/prompts";
import { aiCacheService } from "@/services/cache/ai-cache.service";
import { databaseService } from "@/services/database/database.service";
import { llmOrchestrator } from "@/services/llm/orchestrator";
import { isDatabaseAvailable } from "@/lib/prisma";
import { fallbackCatalog } from "@/lib/fallback-catalog";

export class HiddenGemsService {
  async findGems(input: HiddenGemsRequest) {
    const destinationName =
      input.destinationName ??
      fallbackCatalog.find((d) => d.id === input.destinationId)?.name ??
      "Your destination";

    const queryText = [
      `Travel vibe: ${input.vibe}`,
      `Interests: ${input.interests.join(", ")}`,
      `Seek hidden gems and offbeat places in ${destinationName}`,
    ].join(". ");

    let candidates: Array<Record<string, unknown>> = [];

    try {
      const embedding = await llmOrchestrator.embedText(queryText);
      const rows = await databaseService.searchHiddenGemsByVector({
        queryEmbedding: embedding,
        destinationId: input.destinationId,
        limit: input.limit,
      });

      candidates = rows.map((row) => {
        if ("similarity" in row) {
          return {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            similarityScore: Number(row.similarity),
            destinationName: row.destination_name,
          };
        }
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          destinationName: row.destinationName,
        };
      });
    } catch {
      candidates = fallbackCatalog
        .flatMap((d) =>
          d.attractions
            .filter((a) => a.hiddenGem)
            .map((a) => ({
              id: a.id,
              name: a.name,
              description: a.description,
              category: a.category,
              destinationName: d.name,
            })),
        )
        .slice(0, input.limit);
    }

    const travelerJson = JSON.stringify({
      interests: input.interests,
      vibe: input.vibe,
    });
    const candidatesJson = JSON.stringify(candidates);
    const prompt = hiddenGemsEnrichmentPrompt({
      destinationName,
      travelerJson,
      candidatesJson,
    });

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) return hiddenGemsResponseSchema.parse(cached);
    }

    const result = await llmOrchestrator.generateJson(hiddenGemsResponseSchema, prompt);

    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, result).catch(() => undefined);
    }

    return result;
  }
}

export const hiddenGemsService = new HiddenGemsService();
