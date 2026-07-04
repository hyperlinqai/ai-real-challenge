import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/recommendation/recommendation-engine.service", () => ({
  recommendationEngineService: {
    recommend: vi.fn(),
  },
}));

import { POST } from "@/app/api/recommendations/route";

describe("POST /api/recommendations", () => {
  it("returns 400 for invalid preferences", async () => {
    const res = await POST(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [] }),
      }),
    );
    expect(res.status).toBe(400);
  });
});
