import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Same answer." },
  { path: "/demo", heading: "A controlled space for tracing reasoning." },
  {
    path: "/demo/session/example-session",
    heading: "The misconception interview will live here.",
  },
  { path: "/report/example-session", heading: "Evidence, not just a score." },
  { path: "/technology", heading: "A testable reasoning pipeline." },
] as const;

for (const route of routes) {
  test(`${route.path} renders`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      route.heading,
    );
  });
}

test("health API returns a success envelope", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    data: { status: "ok" },
    error: null,
  });
});
