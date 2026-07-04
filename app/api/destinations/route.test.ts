import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/database/database.service", () => ({
  databaseService: {
    listDestinations: vi.fn(),
  },
}));

import { GET } from "@/app/api/destinations/route";
import { databaseService } from "@/services/database/database.service";

describe("GET /api/destinations", () => {
  it("returns destination list", async () => {
    vi.mocked(databaseService.listDestinations).mockResolvedValue([
      {
        id: "dest-jaipur",
        name: "Jaipur",
        state: "Rajasthan",
        country: "India",
        description: "Pink City",
        vibe: "HERITAGE",
        budgetLevel: "MODERATE",
        tags: ["forts"],
        heroImage: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.destinations).toHaveLength(1);
    expect(json.destinations[0].name).toBe("Jaipur");
  });
});
