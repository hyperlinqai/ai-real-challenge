import { describe, expect, it, vi } from "vitest";

import { withTimeout, safeProviderCall } from "@/utils/provider-utils";

describe("withTimeout", () => {
  it("resolves when promise finishes in time", async () => {
    await expect(withTimeout(Promise.resolve(42), 500)).resolves.toBe(42);
  });

  it("rejects when promise exceeds timeout", async () => {
    await expect(
      withTimeout(new Promise((r) => setTimeout(() => r(1), 200)), 50, "slow"),
    ).rejects.toThrow(/slow timed out/);
  });
});

describe("safeProviderCall", () => {
  it("returns result on success", async () => {
    const errors: { provider: string; message: string }[] = [];
    const value = await safeProviderCall("Test", () => Promise.resolve(["ok"]), [], errors);
    expect(value).toEqual(["ok"]);
    expect(errors).toHaveLength(0);
  });

  it("returns fallback and logs on failure", async () => {
    const errors: { provider: string; message: string }[] = [];
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const value = await safeProviderCall(
      "Wiki",
      () => Promise.reject(new Error("network down")),
      [] as string[],
      errors,
    );
    expect(value).toEqual([]);
    expect(errors[0]?.provider).toBe("Wiki");
    expect(errors[0]?.message).toContain("network down");
    warn.mockRestore();
  });
});
