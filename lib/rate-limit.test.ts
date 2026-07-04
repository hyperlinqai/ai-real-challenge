import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const limiter = createRateLimiter({ interval: 60_000, limit: 3 });
    expect(limiter.check("a").success).toBe(true);
    expect(limiter.check("a").success).toBe(true);
    expect(limiter.check("a").remaining).toBe(0);
  });

  it("blocks when limit exceeded", () => {
    const limiter = createRateLimiter({ interval: 60_000, limit: 2 });
    limiter.check("ip");
    limiter.check("ip");
    expect(limiter.check("ip").success).toBe(false);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter({ interval: 60_000, limit: 1 });
    expect(limiter.check("a").success).toBe(true);
    expect(limiter.check("b").success).toBe(true);
    expect(limiter.check("a").success).toBe(false);
  });

  it("resets after interval", () => {
    const limiter = createRateLimiter({ interval: 1_000, limit: 1 });
    limiter.check("x");
    expect(limiter.check("x").success).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(limiter.check("x").success).toBe(true);
  });
});
