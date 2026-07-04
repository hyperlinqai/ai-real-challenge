import type { KnowledgeProvider, KnowledgeResult } from "@/types/knowledge";
import { databaseService } from "@/services/database/database.service";
import { vectorSearchService } from "@/services/vector/vector-search.service";

export class LocalDatabaseKnowledgeProvider implements KnowledgeProvider {
  readonly name = "Local Database" as const;

  async search(
    query: string,
    options?: { destination?: string; limit?: number },
  ): Promise<KnowledgeResult[]> {
    const limit = options?.limit ?? 8;
    const vectorHits = await vectorSearchService.search({
      query,
      destinationName: options?.destination,
      limit,
    });

    if (vectorHits.length >= limit) {
      return vectorHits;
    }

    const catalog = await databaseService.getDestinationCatalog();
    const flat: KnowledgeResult[] = catalog.flatMap((dest) => {
      const destMatch = !options?.destination ||
        dest.name.toLowerCase().includes(options.destination.toLowerCase());

      if (!destMatch) return [];

      const items: KnowledgeResult[] = [
        {
          id: dest.id,
          title: dest.name,
          summary: dest.description.slice(0, 280),
          description: dest.description,
          tags: [...dest.tags],
          source: "Local Database",
          destinationName: dest.name,
        },
      ];

      for (const att of dest.attractions) {
        items.push({
          id: att.id,
          title: att.name,
          summary: att.description.slice(0, 280),
          description: att.description,
          tags: [...att.tags, att.category],
          source: att.hiddenGem ? "Hidden Gems" : "Local Database",
          destinationName: dest.name,
        });
      }
      return items;
    });

    const q = query.toLowerCase();
    const keywordHits = flat
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, limit);

    const merged = [...vectorHits];
    for (const hit of keywordHits) {
      if (!merged.some((m) => m.id === hit.id)) merged.push(hit);
    }
    return merged.slice(0, limit);
  }
}

export const localDatabaseKnowledgeProvider = new LocalDatabaseKnowledgeProvider();
