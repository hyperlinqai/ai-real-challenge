import { prisma } from "@/lib/prisma";
import { hashPrompt } from "@/utils/hash";

export class AiCacheService {
  async get<T>(prompt: string): Promise<T | null> {
    const promptHash = hashPrompt(prompt);
    const row = await prisma.cachedAiResponse.findUnique({
      where: { promptHash },
    });
    if (!row) return null;
    try {
      return JSON.parse(row.response) as T;
    } catch {
      return null;
    }
  }

  async set(prompt: string, data: unknown): Promise<void> {
    const promptHash = hashPrompt(prompt);
    const response = JSON.stringify(data);
    await prisma.cachedAiResponse.upsert({
      where: { promptHash },
      create: { promptHash, response },
      update: { response },
    });
  }
}

export const aiCacheService = new AiCacheService();
