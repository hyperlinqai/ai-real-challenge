import { describe, expect, it } from "vitest";

import { ragUserProfileSchema } from "@/lib/schemas/rag";

describe("ragUserProfileSchema", () => {
  it("accepts a valid profile", () => {
    const result = ragUserProfileSchema.safeParse({
      interests: ["history", "food"],
      budget: "moderate",
      budgetInr: 25000,
      travelDays: 4,
      vibe: "heritage",
      groupSize: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty interests", () => {
    const result = ragUserProfileSchema.safeParse({
      interests: [],
      budget: "moderate",
      travelDays: 4,
      vibe: "heritage",
      groupSize: 2,
    });
    expect(result.success).toBe(false);
  });

  it("rejects travel days outside bounds", () => {
    const result = ragUserProfileSchema.safeParse({
      interests: ["nature"],
      budget: "budget",
      travelDays: 0,
      vibe: "nature",
      groupSize: 1,
    });
    expect(result.success).toBe(false);
  });
});
