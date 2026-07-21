import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Same answer." },
  {
    path: "/demo",
    heading:
      "See why two identical answers can need completely different support.",
  },
  { path: "/demo/judge", heading: "Same answer." },
  {
    path: "/demo/session/example-session",
    heading: "If advertising cost becomes 5",
  },
  { path: "/report/example-session", heading: "Your reasoning changed." },
  { path: "/technology", heading: "The AI proposes and adapts." },
  { path: "/technology/dataset", heading: "Curated records" },
  {
    path: "/technology/evaluation",
    heading: "Prototype system-behavior evaluation",
  },
] as const;

for (const route of routes) {
  test(`${route.path} renders`, async ({ page }) => {
    await page.goto(route.path);
    await expect(
      page
        .getByRole("heading", { level: 1 })
        .filter({ hasText: route.heading }),
    ).toBeVisible();
  });
}

test("landing page renders its primary product sections", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Same answer/i }),
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
    page.getByRole("link", { name: "Watch the two-minute demo" }),
  ).toHaveAttribute("href", "/demo/judge");
  await expect(
    page.getByRole("link", { name: "Try as a learner" }),
  ).toHaveAttribute("href", "/demo");
});

test("how-it-works anchor navigates to the connected journey", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "How it works" }).click();

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

test("essential reasoning proof exists when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => null,
    });
  });
  await page.goto("/");

  await expect(
    page.getByText("Same answer: 10", { exact: true }),
  ).toBeVisible();
});

test("reduced-motion preference keeps the learner comparison readable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByText("Different support", { exact: true }),
  ).toBeVisible();
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

test("judge mode hydration tolerates restored browser state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "mindtrace-judge-demo",
      JSON.stringify({
        focus: "learner-a",
        isPlaying: false,
        mode: "interactive",
        playback: "fast",
        sceneIndex: 3,
        started: true,
      }),
    );
  });

  await page.goto("/demo/judge");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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

test("readiness API returns safe configuration status", async ({ request }) => {
  const response = await request.get("/api/readiness");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    data: {
      version: "1.0.0-build-week",
      databaseConfigured: expect.any(Boolean),
      openAIConfigured: expect.any(Boolean),
    },
    error: null,
  });
});

test("judge mode starts, pauses, resumes, and reaches transfer", async ({
  page,
}) => {
  await page.goto("/demo/judge");
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Same answer.",
  );

  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Play" }).click();
  await page.getByRole("button", { name: "Skip animation" }).click();
  await expect(page.getByText("Learner A: approximate growth")).toBeVisible();
  await page.getByRole("button", { name: "Next scene" }).click();
  await expect(page.getByText("Learner A verification")).toBeVisible();

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "Next scene" }).click();
  }

  await expect(
    page.getByRole("heading", { level: 1, name: "Transfer challenge" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restart" }).click();
  await expect(page.getByText("Scene 1 of")).toBeVisible();
});

test("judge mode supports interactive label and mobile layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo/judge");
  await page.getByRole("button", { name: "Explore manually" }).click();

  await expect(
    page.getByText("Interactive mode is a prototype path"),
  ).toBeVisible();
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
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
  await page
    .getByRole("button", { name: "Start the guided comparison" })
    .click();
  await expect(page).toHaveURL(/\/demo\/session\/mt_[a-z0-9]+\?mode=compare/);

  await page.getByRole("button", { name: "Load learner response" }).click();
  await page.getByRole("button", { name: "Submit my reasoning" }).click();
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
  await page.getByRole("button", { name: "Submit my reasoning" }).click();
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

test("generated session refresh resumes the persisted stage", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: "Start the guided comparison" })
    .click();
  await expect(page).toHaveURL(/\/demo\/session\/mt_[a-z0-9]+\?mode=compare/);

  await page.getByRole("button", { name: "Load learner response" }).click();
  await page.getByRole("button", { name: "Submit my reasoning" }).click();
  await expect(
    page.getByText("MindTrace is noticing patterns", { exact: true }).first(),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByText("MindTrace is noticing patterns", { exact: true }).first(),
  ).toBeVisible();
});

test("can complete retry, transfer, and open report", async ({ page }) => {
  await page.goto("/demo/session/demo-session?mode=compare");
  await page.getByRole("button", { name: "Load learner response" }).click();
  await page.getByRole("button", { name: "Submit my reasoning" }).click();
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
  await page.waitForURL(/\/report\//);

  await expect(
    page
      .getByRole("heading", { level: 1 })
      .filter({ hasText: "Your reasoning changed." }),
  ).toBeVisible();
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
  await expect(page.getByText("Step: Understand the problem")).toBeVisible();
});
