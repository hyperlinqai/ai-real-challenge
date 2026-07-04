import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/rag/rag-orchestrator.service", () => ({
  ragOrchestratorService: {
    recommend: vi.fn(),
  },
}));

import { POST } from "@/app/api/rag/recommend/route";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

const validProfile = {
  interests: ["history"],
  budget: "moderate",
  travelDays: 4,
  vibe: "heritage",
  groupSize: 2,
};

describe("POST /api/rag/recommend", () => {
  it("returns 400 for malformed JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/rag/recommend", { method: "POST", body: "{" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid profile", async () => {
    const res = await POST(
      new Request("http://localhost/api/rag/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [] }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 when orchestrator succeeds", async () => {
    vi.mocked(ragOrchestratorService.recommend).mockResolvedValue({
      summary: "Test trip",
      destination: { name: "Jaipur", state: "Rajasthan", country: "India" },
      whyItMatches: "Heritage fit",
      suggestedItinerary: [{ day: 1, plan: "Forts" }],
      bestExperiences: ["Bazaar walk"],
      thingsToAvoid: ["Midday sun"],
      localEtiquette: ["Dress modestly at temples"],
      bestTimeToVisit: "Oct–Mar",
      estimatedBudgetInr: 20000,
      sections: {
        overview: { title: "Overview", content: "c", sources: ["Local Database"] },
        history: { title: "History", content: "c", sources: ["Wikipedia"] },
        hiddenGems: { title: "Hidden Gems", content: "c", sources: ["Hidden Gems"] },
        culturalExperiences: { title: "Cultural Experiences", content: "c", sources: ["Wikivoyage"] },
        localFood: { title: "Local Food", content: "c", sources: ["Wikivoyage"] },
        events: { title: "Events", content: "c", sources: ["Events"] },
        nearbyAttractions: { title: "Nearby Attractions", content: "c", sources: ["Local Database"] },
        travelTips: { title: "Travel Tips", content: "c", sources: ["Wikivoyage"] },
      },
      sources: ["Wikipedia"],
    });

    const res = await POST(
      new Request("http://localhost/api/rag/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validProfile),
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.destination.name).toBe("Jaipur");
  });
});
