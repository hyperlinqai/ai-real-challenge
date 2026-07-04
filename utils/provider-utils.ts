const DEFAULT_TIMEOUT_MS = 8_000;

export async function withTimeout<T>(
  promise: Promise<T>,
  ms = DEFAULT_TIMEOUT_MS,
  label = "operation",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function safeProviderCall<T>(
  provider: string,
  fn: () => Promise<T>,
  fallback: T,
  errors: { provider: string; message: string }[],
): Promise<T> {
  try {
    return await withTimeout(fn(), DEFAULT_TIMEOUT_MS, provider);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({ provider, message });
    console.warn(`[Knowledge] ${provider} failed:`, message);
    return fallback;
  }
}
