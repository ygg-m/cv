import { test, expect, type Page } from "@playwright/test";

// ADR 0003: baselines are generated and compared only inside the Playwright Docker image.
test.beforeAll(() => {
  if (!process.env.PLAYWRIGHT_DOCKER) {
    throw new Error(
      "Visual tests only run in the Playwright Docker image (set PLAYWRIGHT_DOCKER=1). " +
        "Use `npm run test:visual:docker`, or the CI 'visual' job.",
    );
  }
});

const THEMES = ["dark", "light"] as const;
const LOCALES = [
  { id: "en", query: "" },
  { id: "pt-BR", query: "?lang=pt-BR" },
] as const;
const VIEWPORTS = [
  { id: "desktop", width: 1280, height: 800 },
  { id: "mobile", width: 375, height: 812 },
] as const;
const MODALS = [
  { id: "more-experience", button: "More experience" },
  { id: "more-education", button: "More education" },
  { id: "dev-projects", button: "Dev Projects" },
] as const;

// The live CI badge changes with every run; replace it with a fixed image so screenshots are deterministic.
const BADGE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="78" height="20"><rect width="78" height="20" rx="3" fill="#3fb950"/><text x="39" y="14" fill="#fff" font-family="sans-serif" font-size="11" text-anchor="middle">CI passing</text></svg>';

async function prepare(page: Page, theme: string, query: string) {
  await page.route("**/badge.svg*", (route) => route.fulfill({ contentType: "image/svg+xml", body: BADGE_SVG }));
  await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
  await page.goto(`/${query}`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  // Lazy images below the fold would otherwise be missing from a full-page capture.
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((img) => (img.loading = "eager"));
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
  });
}

const options = { animations: "disabled", maxDiffPixelRatio: 0.001 } as const;

test.describe("Full page", () => {
  for (const theme of THEMES) {
    for (const locale of LOCALES) {
      for (const viewport of VIEWPORTS) {
        test(`TC-VIS-01 ${theme} / ${locale.id} / ${viewport.id}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await prepare(page, theme, locale.query);
          await expect(page).toHaveScreenshot(`page-${theme}-${locale.id}-${viewport.id}.png`, {
            ...options,
            fullPage: true,
          });
        });
      }
    }
  }
});

test.describe("Modals", () => {
  for (const theme of THEMES) {
    for (const modal of MODALS) {
      test(`TC-VIS-02 ${modal.id} / ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await prepare(page, theme, "");
        await page.getByRole("button", { name: modal.button }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page).toHaveScreenshot(`modal-${modal.id}-${theme}.png`, options);
      });
    }
  }
});
