import { describe, expect, it } from "vitest";

import { contextBuilder } from "@/services/rag/context-builder.service";
import type { KnowledgeResult } from "@/types/knowledge";

const sampleHit = (overrides: Partial<KnowledgeResult>): KnowledgeResult => ({
  id: "1",
  title: "Sample",
  summary: "Summary",
  description: "Description about local food and culture.",
  tags: [],
  source: "Wikipedia",
  ...overrides,
});

describe("ContextBuilder", () => {
  it("prefers destination hint from profile", () => {
    const ctx = contextBuilder.build({
      profile: {
        interests: ["history"],
        budget: "moderate",
        travelDays: 3,
        vibe: "heritage",
        groupSize: 2,
        destinationHint: "Jaipur",
      },
      retrieval: [],
    });
    expect(ctx.destination).toBe("Jaipur");
  });

  it("aggregates sources from retrieval", () => {
    const ctx = contextBuilder.build({
      profile: {
        interests: ["food"],
        budget: "budget",
        travelDays: 2,
        vibe: "foodie",
        groupSize: 1,
      },
      retrieval: [
        sampleHit({ source: "Wikipedia", title: "Jaipur history" }),
        sampleHit({ source: "Wikivoyage", title: "Jaipur guide", id: "2" }),
      ],
    });
    expect(ctx.sources).toContain("Wikipedia");
    expect(ctx.sources).toContain("Wikivoyage");
  });

  it("aggregates food-related retrieval into food list", () => {
    const ctx = contextBuilder.build({
      profile: {
        interests: ["food"],
        budget: "budget",
        travelDays: 2,
        vibe: "foodie",
        groupSize: 1,
      },
      retrieval: [
        {
          id: "1",
          title: "Dal Baati",
          summary: "s",
          description: "Rajasthani food specialty",
          tags: ["food"],
          source: "Wikivoyage",
        },
      ],
    });
    expect(ctx.food.some((f) => f.toLowerCase().includes("dal"))).toBe(true);
  });

  it("toPromptContext returns JSON string", () => {
    const ctx = contextBuilder.build({
      profile: {
        interests: ["history"],
        budget: "moderate",
        travelDays: 3,
        vibe: "heritage",
        groupSize: 2,
        destinationHint: "Jaipur",
      },
      retrieval: [],
    });
    const prompt = contextBuilder.toPromptContext(ctx);
    expect(() => JSON.parse(prompt)).not.toThrow();
    expect(JSON.parse(prompt).destination).toBe("Jaipur");
  });
});
