import { eventsResponseSchema, type EventsRequest } from "@/lib/schemas/events";
import { eventRecommendationPrompt } from "@/prompts";
import { aiCacheService } from "@/services/cache/ai-cache.service";
import { databaseService } from "@/services/database/database.service";
import { llmOrchestrator } from "@/services/llm/orchestrator";
import { isDatabaseAvailable } from "@/lib/prisma";
import { fallbackEvents } from "@/lib/fallback-events";

export class EventsService {
  async recommendEvents(input: EventsRequest) {
    const destination = await databaseService.getDestinationById(input.destinationId);
    const destinationName =
      destination && "name" in destination ? destination.name : "Destination";

    let eventsJson: string;
    if (destination && "events" in destination && Array.isArray(destination.events)) {
      eventsJson = JSON.stringify(destination.events);
    } else {
      eventsJson = JSON.stringify(
        fallbackEvents.filter((e) => e.destinationId === input.destinationId),
      );
    }

    const travelerJson = JSON.stringify({
      interests: input.interests,
      vibe: input.vibe,
    });

    const prompt = eventRecommendationPrompt({
      destinationName,
      travelerJson,
      eventsJson,
    });

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) return eventsResponseSchema.parse(cached);
    }

    const result = await llmOrchestrator.generateJson(eventsResponseSchema, prompt);

    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, result).catch(() => undefined);
    }

    return result;
  }
}

export const eventsService = new EventsService();
