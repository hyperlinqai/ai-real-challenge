import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseAndValidateBody } from "@/lib/api";

describe("parseAndValidateBody", () => {
  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "not-json",
    });
    const result = await parseAndValidateBody(request, z.object({ name: z.string() }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
    }
  });

  it("returns parsed data for valid JSON", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jaipur" }),
    });
    const result = await parseAndValidateBody(request, z.object({ name: z.string() }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Jaipur");
    }
  });
});
