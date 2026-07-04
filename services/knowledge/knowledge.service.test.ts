import { describe, expect, it } from "vitest";

import { KnowledgeService } from "@/services/knowledge/knowledge.service";
import type { KnowledgeResult } from "@/types/knowledge";

function hit(partial: Partial<KnowledgeResult> & Pick<KnowledgeResult, "title" | "source">): KnowledgeResult {
  return {
    id: partial.id ?? partial.title,
    summary: partial.summary ?? "s",
    description: partial.description ?? "d",
    tags: partial.tags ?? [],
    relevanceScore: partial.relevanceScore,
    ...partial,
  };
}

describe("KnowledgeService", () => {
  const service = new KnowledgeService();

  it("lists registered providers", () => {
    expect(service.listProviders()).toEqual(["Local Database", "Wikipedia", "Wikivoyage"]);
  });

  it("rankResults sorts by relevanceScore descending", () => {
    const ranked = service.rankResults([
      hit({ title: "low", source: "Wikipedia", relevanceScore: 0.2 }),
      hit({ title: "high", source: "Wikivoyage", relevanceScore: 0.9 }),
    ]);
    expect(ranked[0]?.title).toBe("high");
  });

  it("rankResults deduplicates by source:title", () => {
    const ranked = service.rankResults([
      hit({ title: "Jaipur", source: "Wikipedia", relevanceScore: 0.5 }),
      hit({ title: "Jaipur", source: "Wikipedia", relevanceScore: 0.9 }),
    ]);
    expect(ranked).toHaveLength(1);
  });

  it("rankResults uses default score 0.5 when missing", () => {
    const ranked = service.rankResults([
      hit({ title: "a", source: "Wikipedia" }),
      hit({ title: "b", source: "Local Database", relevanceScore: 0.6 }),
    ]);
    expect(ranked[0]?.title).toBe("b");
  });
});
