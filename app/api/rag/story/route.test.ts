import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/rag/rag-orchestrator.service", () => ({
  ragOrchestratorService: {
    generateStory: vi.fn(),
  },
}));

import { POST } from "@/app/api/rag/story/route";
import { ragOrchestratorService } from "@/services/rag/rag-orchestrator.service";

describe("POST /api/rag/story", () => {
  it("returns 400 for invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/rag/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationName: "" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns story JSON on success", async () => {
    vi.mocked(ragOrchestratorService.generateStory).mockResolvedValue({
      title: "Tale of Amber",
      style: "historical",
      wordCount: 320,
      story: "x".repeat(220),
      narrationTips: ["Pause at the fort gates"],
      sources: ["Wikipedia"],
    });

    const res = await POST(
      new Request("http://localhost/api/rag/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationName: "Jaipur", style: "historical" }),
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Tale of Amber");
  });
});
