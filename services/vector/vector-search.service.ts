import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { embeddingService } from "@/services/embeddings/embedding.service";
import { cosineSimilarity } from "@/utils/cosine-similarity";
import type { KnowledgeResult } from "@/types/knowledge";

const SOURCE_LABELS: Record<string, KnowledgeResult["source"]> = {
  WIKIPEDIA: "Wikipedia",
  WIKIVOYAGE: "Wikivoyage",
  LOCAL_DATABASE: "Local Database",
  HIDDEN_GEMS: "Hidden Gems",
  EVENTS: "Events",
  TRAVEL_TIPS: "Travel Tips",
  ATTRACTION: "Local Database",
  HOST: "Local Database",
  STORY: "Travel Tips",
};

export class VectorSearchService {
  async search(params: {
    query: string;
    destinationName?: string;
    limit?: number;
  }): Promise<KnowledgeResult[]> {
    const limit = params.limit ?? 10;
    const queryEmbedding = await embeddingService.embed(params.query);

    if (!(await isDatabaseAvailable())) {
      return [];
    }

    const docs = await prisma.knowledgeDocument.findMany({
      where: params.destinationName
        ? { destinationName: { contains: params.destinationName, mode: "insensitive" } }
        : undefined,
      take: 200,
    });

    return docs
      .filter((d) => d.embedding.length > 0)
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        summary: doc.summary ?? doc.description.slice(0, 240),
        description: doc.description,
        tags: doc.tags,
        source: SOURCE_LABELS[doc.source] ?? "Local Database",
        destinationName: doc.destinationName ?? undefined,
        relevanceScore: cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, limit);
  }
}

export const vectorSearchService = new VectorSearchService();
