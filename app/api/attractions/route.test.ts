import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("@/services/database/database.service", () => ({
  databaseService: {
    listAttractions: vi.fn(),
  },
}));

import { GET } from "@/app/api/attractions/route";
import { databaseService } from "@/services/database/database.service";

describe("GET /api/attractions", () => {
  it("returns attractions list", async () => {
    vi.mocked(databaseService.listAttractions).mockResolvedValue([
      { id: "att-1", name: "Amber Fort" },
    ] as never);

    const res = await GET(new Request("http://localhost/api/attractions"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.attractions).toHaveLength(1);
  });

  it("passes destinationId query param", async () => {
    vi.mocked(databaseService.listAttractions).mockResolvedValue([]);
    await GET(new Request("http://localhost/api/attractions?destinationId=dest-jaipur"));
    expect(databaseService.listAttractions).toHaveBeenCalledWith("dest-jaipur");
  });
});

describe("createPostJsonHandler", () => {
  it("validates and returns JSON", async () => {
    const { createPostJsonHandler } = await import("@/lib/api");
    const POST = createPostJsonHandler({
      schema: z.object({ name: z.string().min(1) }),
      fallbackError: "fail",
      handler: async (data) => ({ hello: data.name }),
    });

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Jaipur" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ hello: "Jaipur" });
  });
});
