import { apiError } from "@/lib/api/response";

interface RateLimitState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitState>();

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

export function rateLimitedResponse(retryAfterSeconds: number) {
  return apiError(
    "RATE_LIMITED",
    "Too many requests. Please wait briefly and try again.",
    429,
    { retryAfterSeconds },
    undefined,
  );
}
