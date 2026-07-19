import { describe, expect, it } from "vitest";

import { learnerResponseSchema } from "@/lib/validation/session";

describe("learner response validation", () => {
  it("accepts a bounded response", () => {
    const result = learnerResponseSchema.safeParse({
      sessionId: "session-1",
      answer: "The denominator stays constant.",
      confidence: 3,
    });

    expect(result.success).toBe(true);
  });

  it("rejects confidence outside the five-point scale", () => {
    const result = learnerResponseSchema.safeParse({
      sessionId: "session-1",
      answer: "Unsure",
      confidence: 6,
    });

    expect(result.success).toBe(false);
  });
});
