import { llmOrchestrator } from "@/services/llm/orchestrator";
import { hashPrompt } from "@/utils/hash";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";

export class EmbeddingService {
  async embed(text: string): Promise<number[]> {
    const normalized = text.trim().slice(0, 8000);
    const cacheKey = hashPrompt(`embed:${normalized}`);

    if (await isDatabaseAvailable()) {
      const cached = await prisma.cachedAiResponse.findUnique({
        where: { promptHash: cacheKey },
      });
      if (cached) {
        try {
          return JSON.parse(cached.response) as number[];
        } catch {
          /* regenerate */
        }
      }
    }

    const embedding = await llmOrchestrator.embedText(normalized);

    if (await isDatabaseAvailable()) {
      await prisma.cachedAiResponse
        .upsert({
          where: { promptHash: cacheKey },
          create: { promptHash: cacheKey, response: JSON.stringify(embedding) },
          update: { response: JSON.stringify(embedding) },
        })
        .catch(() => undefined);
    }

    return embedding;
  }
}

export const embeddingService = new EmbeddingService();
