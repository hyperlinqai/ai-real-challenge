import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/knowledge/knowledge.service", () => ({
  knowledgeService: {
    searchAll: vi.fn(),
  },
}));

import { GET } from "@/app/api/knowledge/search/route";
import { knowledgeService } from "@/services/knowledge/knowledge.service";

describe("GET /api/knowledge/search", () => {
  it("returns 400 without query", async () => {
    const res = await GET(new Request("http://localhost/api/knowledge/search"));
    expect(res.status).toBe(400);
  });

  it("returns merged results", async () => {
    vi.mocked(knowledgeService.searchAll).mockResolvedValue({
      results: [
        {
          id: "1",
          title: "Jaipur",
          summary: "Pink city",
          description: "Forts and bazaars",
          tags: [],
          source: "Wikipedia",
        },
      ],
      errors: [],
    });

    const res = await GET(
      new Request("http://localhost/api/knowledge/search?q=Jaipur&limit=5"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(1);
    expect(json.results[0].title).toBe("Jaipur");
  });
});
