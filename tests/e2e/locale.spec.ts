import { test, expect } from "@playwright/test";

test.describe("Locale", () => {
  test("TC-LOC-01 defaults to English", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#subtitle")).toHaveText("Test Automation");
    await expect(page.getByRole("button", { name: "Switch language to Portuguese" })).toBeVisible();
  });

  test("TC-LOC-02 ?lang=pt-BR deep link renders Portuguese", async ({ page }) => {
    await page.goto("/?lang=pt-BR");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator("#subtitle")).toHaveText("Automação de Testes");
    await expect(page).toHaveTitle(/Ygor Goulart - QA Tester/);
    await expect(page.getByRole("button", { name: "Mudar idioma para inglês" })).toBeVisible();
  });

  test("TC-LOC-03 the toggle switches Locale and reflects it in the URL", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch language to Portuguese" }).click();
    await expect(page.locator("#subtitle")).toHaveText("Automação de Testes");
    await expect(page).toHaveURL(/\?lang=pt-BR$/);
    await page.getByRole("button", { name: "Mudar idioma para inglês" }).click();
    await expect(page.locator("#subtitle")).toHaveText("Test Automation");
    await expect(page).toHaveURL(/\?lang=en$/);
  });

  test("TC-LOC-04 the chosen Locale persists across visits", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch language to Portuguese" }).click();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator("#subtitle")).toHaveText("Automação de Testes");
  });

  test("TC-LOC-05 the query string overrides the stored choice", async ({ page }) => {
    await page.goto("/?lang=pt-BR");
    await page.getByRole("button", { name: "Mudar idioma para inglês" }).click();
    await page.goto("/?lang=pt-BR");
    await expect(page.locator("#subtitle")).toHaveText("Automação de Testes");
  });

  test("TC-LOC-06 an unsupported ?lang falls back to English", async ({ page }) => {
    await page.goto("/?lang=fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#subtitle")).toHaveText("Test Automation");
  });

  test("TC-LOC-07 the page still works when storage is blocked", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch language to Portuguese" }).click();
    await expect(page.locator("#subtitle")).toHaveText("Automação de Testes");
  });
});
