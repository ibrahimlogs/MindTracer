import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Same answer." },
  { path: "/demo", heading: "Same answer. Different reasoning journey." },
  {
    path: "/demo/session/example-session",
    heading: "If advertising cost becomes 5",
  },
  { path: "/report/example-session", heading: "Evidence, not just a score." },
  { path: "/technology", heading: "Adaptation proposed by AI." },
  { path: "/technology/dataset", heading: "Curated records" },
] as const;

for (const route of routes) {
  test(`${route.path} renders`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      route.heading,
    );
  });
}

test("landing page renders its primary product sections", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /The answer is identical/i }),
  ).toBeVisible();
  await expect(page.locator("#how-it-works")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Measure the change in reasoning/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Answer completion and capability/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Generative where adaptation matters/i }),
  ).toBeVisible();
});

test("landing calls to action point to demo and technology", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Experience the reasoning demo" }),
  ).toHaveAttribute("href", "/demo");
  await expect(
    page.getByRole("link", { name: "Explore the architecture" }),
  ).toHaveAttribute("href", "/technology");
});

test("how-it-works anchor navigates to the connected journey", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See how it works" }).click();

  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(page.locator("#how-it-works")).toBeInViewport();
});

test("mobile menu opens, exposes navigation, and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuDisclosure = page.locator(
    'summary[aria-label="Toggle navigation menu"]',
  );
  await menuDisclosure.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Experience the demo" }),
  ).toHaveAttribute("href", "/demo");
  await menuDisclosure.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).not.toBeVisible();
});

test("essential reasoning meaning exists when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => null,
    });
  });
  await page.goto("/");

  await expect(page.getByTestId("reasoning-static-fallback")).toBeVisible();
  await expect(
    page.getByText("Independent transfer", { exact: true }),
  ).toBeVisible();
});

test("reduced-motion preference receives the static reasoning fallback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByTestId("reasoning-static-fallback")).toBeVisible();
});

test("landing hydration produces no warnings", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(errors.filter((message) => /hydration/i.test(message))).toEqual([]);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
] as const) {
  test(`landing has no horizontal overflow at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
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

test("dataset explorer route loads and opens concept detail", async ({
  page,
}) => {
  await page.goto("/technology/dataset");

  await expect(page.getByText("Development dataset explorer")).toBeVisible();
  await page
    .getByRole("button", { name: /Constant Difference Recognize/i })
    .click();
  await expect(
    page.getByRole("heading", { name: "Constant Difference" }),
  ).toBeVisible();
});

test("dataset explorer opens problem detail with transfer mapping", async ({
  page,
}) => {
  await page.goto("/technology/dataset");

  await page.getByRole("button", { name: /Advertising and Sales/i }).click();
  await expect(
    page.getByRole("heading", { name: "Advertising and Sales" }),
  ).toBeVisible();
  await expect(
    page.getByText("study_score_001", { exact: true }),
  ).toBeVisible();
});

test("dataset explorer opens misconception ladder", async ({ page }) => {
  await page.goto("/technology/dataset");

  await page.getByRole("button", { name: /Direction without rate/i }).click();
  await expect(
    page.getByText("Intervention ladders", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Level 8", { exact: true })).toBeVisible();
});

test("dataset explorer filters evaluation cases", async ({ page }) => {
  await page.goto("/technology/dataset");

  await page.getByLabel("Review status").selectOption("needs_review");
  await expect(
    page.getByRole("button", { name: /needs_review/i }).first(),
  ).toBeVisible();
});

test("guided comparison shows different learner paths", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: "Start the guided comparison" }).click();

  await page.getByRole("button", { name: "Load learner response" }).click();
  await page.getByRole("button", { name: "Submit initial reasoning" }).click();
  await page.getByText("Demo controls").click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Direction without rate").first()).toBeVisible();
  await expect(
    page.getByText("When advertising increases from 1 to 2").first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Load guided response" }).click();
  await page.getByRole("button", { name: "Submit verification" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page
    .getByRole("button", { name: "Show smallest useful intervention" })
    .click();
  await expect(page.getByText("Consecutive differences")).toBeVisible();

  await page.getByRole("button", { name: "Restart" }).first().click();
  await page.getByRole("tab", { name: "Learner B" }).click();
  await page.getByRole("button", { name: "Load learner response" }).click();
  await page.getByRole("button", { name: "Submit initial reasoning" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Starting offset ignored").first()).toBeVisible();
  await expect(
    page.getByText("If sales were exactly double").first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Load guided response" }).click();
  await page.getByRole("button", { name: "Submit verification" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page
    .getByRole("button", { name: "Show smallest useful intervention" })
    .click();
  await expect(page.getByText("Check the multiplication claim")).toBeVisible();
});

test("can complete retry, transfer, and open report", async ({ page }) => {
  await page.goto("/demo/session/demo-session?mode=compare");
  await page.getByRole("button", { name: "Load learner response" }).click();
  await page.getByRole("button", { name: "Submit initial reasoning" }).click();
  await page.getByText("Demo controls").click();

  for (let index = 0; index < 2; index += 1) {
    await page.getByRole("button", { name: "Next" }).click();
  }

  await page.getByRole("button", { name: "Load guided response" }).click();
  await page.getByRole("button", { name: "Submit verification" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page
    .getByRole("button", { name: "Show smallest useful intervention" })
    .click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Load revised response" }).click();
  await page.getByRole("button", { name: "Submit retry" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Load transfer response" }).click();
  await page.getByRole("button", { name: "Submit transfer" }).click();
  await page.getByRole("link", { name: "Open Reasoning Delta report" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Evidence, not just a score.",
  );
});

test("workspace has no mobile horizontal overflow with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo/session/demo-session?mode=compare");

  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
  await expect(page.getByText("Stage: Problem")).toBeVisible();
});
