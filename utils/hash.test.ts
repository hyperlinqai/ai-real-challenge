import { describe, expect, it } from "vitest";

import { hashPrompt } from "@/utils/hash";

describe("hashPrompt", () => {
  it("returns a stable sha256 hex digest", () => {
    const a = hashPrompt("same input");
    const b = hashPrompt("same input");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("differs for different inputs", () => {
    expect(hashPrompt("a")).not.toBe(hashPrompt("b"));
  });
});
