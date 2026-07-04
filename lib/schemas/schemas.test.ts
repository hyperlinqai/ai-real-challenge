import { describe, expect, it } from "vitest";

import { eventsRequestSchema } from "@/lib/schemas/events";
import { hiddenGemsRequestSchema } from "@/lib/schemas/hidden-gems";
import { hostsRequestSchema } from "@/lib/schemas/hosts";
import { knowledgeSearchQuerySchema, ragStoryRequestSchema } from "@/lib/schemas/rag";
import { travelPreferencesSchema } from "@/lib/schemas/recommendations";
import { storyRequestSchema } from "@/lib/schemas/story";

describe("API input schemas", () => {
  it("validates travel preferences", () => {
    const ok = travelPreferencesSchema.safeParse({
      interests: ["food"],
      budget: "budget",
      travelDays: 3,
      vibe: "foodie",
    });
    expect(ok.success).toBe(true);
  });

  it("validates story request", () => {
    const ok = storyRequestSchema.safeParse({
      attractionName: "Amber Fort",
      destinationName: "Jaipur",
      style: "historical",
    });
    expect(ok.success).toBe(true);
  });

  it("validates RAG story request", () => {
    const ok = ragStoryRequestSchema.safeParse({
      destinationName: "Jaipur",
      style: "mythological",
    });
    expect(ok.success).toBe(true);
  });

  it("validates knowledge search query", () => {
    const ok = knowledgeSearchQuerySchema.safeParse({ q: "ghats", limit: "5" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.limit).toBe(5);
  });

  it("validates events request shape", () => {
    const ok = eventsRequestSchema.safeParse({
      destinationId: "dest-jaipur",
      interests: ["culture"],
      vibe: "heritage",
    });
    expect(ok.success).toBe(true);
  });

  it("validates hidden gems request", () => {
    const ok = hiddenGemsRequestSchema.safeParse({
      interests: ["nature"],
      vibe: "nature",
      limit: 5,
    });
    expect(ok.success).toBe(true);
  });

  it("validates hosts request", () => {
    const ok = hostsRequestSchema.safeParse({
      destinationId: "dest-jaipur",
      interests: ["crafts"],
      vibe: "heritage",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects empty knowledge search", () => {
    expect(knowledgeSearchQuerySchema.safeParse({ q: "" }).success).toBe(false);
  });
});
