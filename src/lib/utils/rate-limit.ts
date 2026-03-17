import { RateLimitError } from "./errors";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  });
}, 60_000);

export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number }
): void {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    throw new RateLimitError(key, entry.resetAt - now);
  }
}
