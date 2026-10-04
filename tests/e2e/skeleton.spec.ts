import { test, expect } from "@playwright/test";

test("TC-SKEL-01 page loads with the owner's name and QA Tester headline", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Ygor Goulart/);
  await expect(page.getByRole("heading", { level: 1, name: "Ygor Goulart" })).toBeVisible();
  await expect(page.locator("#headline")).toHaveText("QA Tester");
});

test("TC-SKEL-02 script runs and marks the document ready", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
});
