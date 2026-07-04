import { hostsResponseSchema, type HostsRequest } from "@/lib/schemas/hosts";
import { hostMatchmakingPrompt } from "@/prompts";
import { aiCacheService } from "@/services/cache/ai-cache.service";
import { databaseService } from "@/services/database/database.service";
import { llmOrchestrator } from "@/services/llm/orchestrator";
import { isDatabaseAvailable } from "@/lib/prisma";
import { fallbackHosts } from "@/lib/fallback-hosts";

export class HostsService {
  async matchHosts(input: HostsRequest) {
    const destination = await databaseService.getDestinationById(input.destinationId);
    const destinationName =
      destination && "name" in destination ? destination.name : "Destination";

    let hostsJson: string;
    if (destination && "localHosts" in destination && Array.isArray(destination.localHosts)) {
      hostsJson = JSON.stringify(destination.localHosts);
    } else {
      hostsJson = JSON.stringify(
        fallbackHosts.filter((h) => h.destinationId === input.destinationId),
      );
    }

    const travelerJson = JSON.stringify({
      interests: input.interests,
      vibe: input.vibe,
    });

    const prompt = hostMatchmakingPrompt({
      destinationName,
      travelerJson,
      hostsJson,
    });

    if (await isDatabaseAvailable()) {
      const cached = await aiCacheService.get<unknown>(prompt).catch(() => null);
      if (cached) return hostsResponseSchema.parse(cached);
    }

    const result = await llmOrchestrator.generateJson(hostsResponseSchema, prompt);

    if (await isDatabaseAvailable()) {
      await aiCacheService.set(prompt, result).catch(() => undefined);
    }

    return result;
  }
}

export const hostsService = new HostsService();
