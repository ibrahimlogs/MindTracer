import { describe, expect, it } from "vitest";

import { apiError, apiSuccess } from "@/lib/api/response";

describe("API response helpers", () => {
  it("creates a typed success envelope", async () => {
    const response = apiSuccess({ id: "session-1" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { id: "session-1" },
      error: null,
    });
  });

  it("creates an error envelope with the requested status", async () => {
    const response = apiError("INVALID_INPUT", "The input was invalid", 422);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      data: null,
      error: { code: "INVALID_INPUT", message: "The input was invalid" },
    });
  });
});
