import { storyResponseSchema, type StoryRequest } from "@/lib/schemas/story";
import { storyGenerationPrompt } from "@/prompts";
import { aiCacheService } from "@/services/cache/ai-cache.service";
import { databaseService } from "@/services/database/database.service";
import { llmOrchestrator } from "@/services/llm/orchestrator";
import { isDatabaseAvailable } from "@/lib/prisma";

export class StoryGeneratorService {
  async generateStory(input: StoryRequest) {
    let attractionContext = `A remarkable place called ${input.attractionName}.`;

    if (input.attractionId && (await isDatabaseAvailable())) {
      const attractions = await databaseService.listAttractions();
      const match = attractions.find((a) => a.id === input.attractionId);
      if (match && "description" in match) {
        attractionContext = match.description;
      }
    }

    const prompt = storyGenerationPrompt({
      attractionName: input.attractionName,
      destinationName: input.destinationName,
      style: input.style,
      attractionContext,
    });

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) return storyResponseSchema.parse(cached);
    }

    const result = await llmOrchestrator.generateJson(storyResponseSchema, prompt);

    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, result).catch(() => undefined);
    }

    return result;
  }

  streamStory(input: StoryRequest) {
    const prompt = storyGenerationPrompt({
      attractionName: input.attractionName,
      destinationName: input.destinationName,
      style: input.style,
      attractionContext: `Place: ${input.attractionName} in ${input.destinationName}. Return only the story prose, 200-400 words, ${input.style} style.`,
    });
    return llmOrchestrator.streamStory(prompt);
  }
}

export const storyGeneratorService = new StoryGeneratorService();
