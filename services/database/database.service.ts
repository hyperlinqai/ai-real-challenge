import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import type { TravelVibe, BudgetLevel } from "@/types/travel";
import { fallbackCatalog } from "@/lib/fallback-catalog";
import { cosineSimilarity } from "@/utils/cosine-similarity";

export class DatabaseService {
  async getDestinationCatalog() {
    if (!(await isDatabaseAvailable())) {
      return fallbackCatalog;
    }

    const destinations = await prisma.destination.findMany({
      include: {
        attractions: { take: 8 },
      },
      take: 20,
    });

    if (destinations.length === 0) {
      return fallbackCatalog;
    }

    return destinations.map((d) => ({
      id: d.id,
      name: d.name,
      state: d.state,
      country: d.country,
      description: d.description,
      vibe: d.vibe.toLowerCase(),
      budgetLevel: d.budgetLevel.toLowerCase(),
      tags: d.tags,
      heroImage: d.heroImage,
      location: d.location,
      attractions: d.attractions.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        category: a.category,
        hiddenGem: a.hiddenGem,
        tags: a.tags,
      })),
    }));
  }

  async getDestinationById(id: string) {
    if (!(await isDatabaseAvailable())) {
      return fallbackCatalog.find((d) => d.id === id) ?? null;
    }
    return prisma.destination.findUnique({
      where: { id },
      include: { attractions: true, events: true, localHosts: true },
    });
  }

  async listDestinations() {
    if (!(await isDatabaseAvailable())) {
      return fallbackCatalog.map(({ attractions: _a, ...rest }) => rest);
    }
    return prisma.destination.findMany({
      orderBy: { name: "asc" },
    });
  }

  async listAttractions(destinationId?: string) {
    if (!(await isDatabaseAvailable())) {
      const all = fallbackCatalog.flatMap((d) =>
        d.attractions.map((a) => ({ ...a, destinationId: d.id })),
      );
      return destinationId ? all.filter((a) => a.destinationId === destinationId) : all;
    }
    return prisma.attraction.findMany({
      where: destinationId ? { destinationId } : undefined,
      include: { destination: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
  }

  async searchHiddenGemsByVector(params: {
    queryEmbedding: number[];
    destinationId?: string;
    limit: number;
  }) {
    const limit = params.limit;

    if (!(await isDatabaseAvailable())) {
      const gems = fallbackCatalog
        .flatMap((d) =>
          d.attractions
            .filter((a) => a.hiddenGem)
            .map((a) => ({ ...a, destinationId: d.id, destinationName: d.name })),
        )
        .slice(0, limit);
      return gems;
    }

    const rows = await prisma.attraction.findMany({
      where: {
        hiddenGem: true,
        ...(params.destinationId ? { destinationId: params.destinationId } : {}),
      },
      include: { destination: { select: { name: true } } },
    });

    return rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        hidden_gem: row.hiddenGem,
        latitude: row.latitude,
        longitude: row.longitude,
        tags: row.tags,
        destination_id: row.destinationId,
        destination_name: row.destination.name,
        similarity:
          row.embedding.length > 0
            ? cosineSimilarity(params.queryEmbedding, row.embedding)
            : 0,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  vibeToEnum(vibe: TravelVibe) {
    return vibe.toUpperCase() as
      | "OFFBEAT"
      | "SPIRITUAL"
      | "ADVENTURE"
      | "FOODIE"
      | "HERITAGE"
      | "NATURE";
  }

  budgetToEnum(budget: BudgetLevel) {
    return budget.toUpperCase() as "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY";
  }
}

export const databaseService = new DatabaseService();
