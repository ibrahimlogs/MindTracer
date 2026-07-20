import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("limits repeated calls inside a window", () => {
    const key = `test-${crypto.randomUUID()}`;

    expect(checkRateLimit({ key, limit: 1, windowMs: 60_000 }).limited).toBe(
      false,
    );
    const limited = checkRateLimit({ key, limit: 1, windowMs: 60_000 });

    expect(limited.limited).toBe(true);
    expect(limited.retryAfterSeconds).toBeGreaterThan(0);
  });
});
