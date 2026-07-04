import type { KnowledgeProvider, KnowledgeResult, ProviderErrorLog } from "@/types/knowledge";
import { wikipediaService, wikivoyageService } from "@/services/knowledge/wikipedia.service";
import { localDatabaseKnowledgeProvider } from "@/services/knowledge/local-database.provider";
import { safeProviderCall } from "@/utils/provider-utils";

export class KnowledgeService {
  private providers: KnowledgeProvider[] = [
    localDatabaseKnowledgeProvider,
    wikipediaService,
    wikivoyageService,
  ];

  listProviders(): KnowledgeResult["source"][] {
    return this.providers.map((p) => p.name);
  }

  async searchAll(params: {
    query: string;
    destination?: string;
    limitPerProvider?: number;
  }): Promise<{ results: KnowledgeResult[]; errors: ProviderErrorLog[] }> {
    const errors: ProviderErrorLog[] = [];
    const limit = params.limitPerProvider ?? 5;

    const batches = await Promise.all(
      this.providers.map((provider) =>
        safeProviderCall(
          provider.name,
          () => provider.search(params.query, { destination: params.destination, limit }),
          [] as KnowledgeResult[],
          errors,
        ),
      ),
    );

    const merged = this.rankResults(batches.flat());
    return { results: merged, errors };
  }

  rankResults(results: KnowledgeResult[]): KnowledgeResult[] {
    const seen = new Set<string>();
    return results
      .sort((a, b) => (b.relevanceScore ?? 0.5) - (a.relevanceScore ?? 0.5))
      .filter((item) => {
        const key = `${item.source}:${item.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }
}

export const knowledgeService = new KnowledgeService();
