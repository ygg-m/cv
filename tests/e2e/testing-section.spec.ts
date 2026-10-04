import { test, expect } from "@playwright/test";

test.describe("How this site is tested", () => {
  test("TC-TST-01 describes every test layer", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#testing");
    await expect(section.getByRole("heading", { level: 2, name: "How this site is tested" })).toBeVisible();
    const layers = section.locator("[data-list='test-layers'] > li");
    await expect(layers).toHaveCount(7);
    for (const tool of ["Playwright", "axe-core", "Vitest", "Lighthouse CI", "GitHub Actions"]) {
      await expect(section.locator("[data-list='test-layers']")).toContainText(tool);
    }
  });

  test("TC-TST-02 links to the report, test plan, source, bugs and CI runs", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("[data-list='testing-links']");
    await expect(links.getByRole("link", { name: "Playwright report" })).toHaveAttribute("href", "reports/");
    await expect(links.getByRole("link", { name: "Test plan" })).toHaveAttribute(
      "href",
      "https://github.com/ygg-m/cv/blob/main/docs/qa/test-plan.md",
    );
    await expect(links.getByRole("link", { name: "Source code" })).toHaveAttribute("href", "https://github.com/ygg-m/cv");
    await expect(links.getByRole("link", { name: "Bug reports" })).toHaveAttribute("href", /issues\?q=label%3Abug$/);
    await expect(links.getByRole("link", { name: "CI runs" })).toHaveAttribute("href", "https://github.com/ygg-m/cv/actions");
  });

  test("TC-TST-03 shows the CI status badge with an accessible name", async ({ page }) => {
    await page.goto("/");
    const badge = page.locator("#testing img");
    await expect(badge).toHaveAttribute("alt", "CI status");
    await expect(badge).toHaveAttribute("src", /actions\/workflows\/ci\.yml\/badge\.svg/);
    await expect(badge).toHaveAttribute("width", "78");
    await expect(badge).toHaveAttribute("height", "20");
  });

  test("TC-TST-04 is localized in Portuguese", async ({ page }) => {
    await page.goto("/?lang=pt-BR");
    const section = page.locator("#testing");
    await expect(section.getByRole("heading", { level: 2, name: "Como este site é testado" })).toBeVisible();
    await expect(section.getByRole("link", { name: "Plano de testes" })).toBeVisible();
    await expect(section.locator("img")).toHaveAttribute("alt", "Status do CI");
    await expect(page.getByRole("navigation").getByRole("link", { name: "Testes" })).toBeVisible();
  });

  test("TC-TST-05 the navigation link reaches the section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Testing" }).click();
    await expect(page).toHaveURL(/#testing$/);
    await expect(page.locator("#testing")).toBeInViewport();
  });
});
