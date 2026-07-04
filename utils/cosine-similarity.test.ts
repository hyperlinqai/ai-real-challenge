import { describe, expect, it } from "vitest";

import { cosineSimilarity } from "@/utils/cosine-similarity";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("returns 0 when a vector has zero magnitude", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("handles different lengths using the shared prefix", () => {
    const score = cosineSimilarity([1, 2], [1, 2, 99]);
    expect(score).toBeCloseTo(1, 5);
  });
});
