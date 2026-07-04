type Bucket = { count: number; resetAt: number };

export type RateLimitOptions = {
  /** Window size in ms */
  interval: number;
  /** Max requests per window per key */
  limit: number;
};

export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, Bucket>();

  function check(key: string): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let bucket = store.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + options.interval };
      store.set(key, bucket);
    }

    if (bucket.count >= options.limit) {
      return { success: false, remaining: 0, resetAt: bucket.resetAt };
    }

    bucket.count += 1;
    return {
      success: true,
      remaining: Math.max(0, options.limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  function reset(key?: string) {
    if (key) store.delete(key);
    else store.clear();
  }

  return { check, reset };
}
