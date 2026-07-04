import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/knowledge/providers/route";

describe("GET /api/knowledge/providers", () => {
  it("lists knowledge providers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.providers).toContain("Wikipedia");
    expect(json.providers).toContain("Local Database");
  });
});
