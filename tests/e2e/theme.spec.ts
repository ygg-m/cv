import { test, expect, type Page } from "@playwright/test";

const darkBg = "rgb(18, 16, 28)";
const lightBg = "rgb(250, 248, 255)";
const bodyBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("Theme", () => {
  test("TC-THM-01 falls back to dark when the OS preference cannot be read", async ({ page }) => {
    // Browsers report "light" or "dark"; neither matching means the preference is unavailable.
    await page.addInitScript(() => {
      window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bodyBg(page)).toBe(darkBg);
  });

  test("TC-THM-02 follows an OS dark preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("TC-THM-03 follows an OS light preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await bodyBg(page)).toBe(lightBg);
  });

  test("TC-THM-04 the toggle switches Theme and persists the choice over the OS preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("TC-THM-05 follows live OS changes until the visitor chooses", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    // The visitor now picks dark explicitly; later OS changes must not override it.
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await page.emulateMedia({ colorScheme: "dark" });
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("TC-THM-06 the Theme is set before first paint (no flash)", async ({ page }) => {
    await page.addInitScript(() => {
      const seen: { value: string | undefined; bodyExisted: boolean }[] = [];
      (window as unknown as { __themeSeen: typeof seen }).__themeSeen = seen;
      new MutationObserver(() =>
        seen.push({ value: document.documentElement.dataset.theme, bodyExisted: !!document.body }),
      ).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-theme"] });
    });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const seen = await page.evaluate(
      () => (window as unknown as { __themeSeen: { value: string; bodyExisted: boolean }[] }).__themeSeen,
    );
    // The first change to data-theme happens while parsing <head>, before <body> exists.
    expect(seen[0]).toEqual({ value: "light", bodyExisted: false });
  });

  test("TC-THM-07 the toggle label follows the Locale", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/?lang=pt-BR");
    await expect(page.getByRole("button", { name: "Mudar para o tema claro" })).toHaveText("Claro");
  });

  test("TC-THM-08 the page works when storage is blocked", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("blocked", "SecurityError");
        },
      });
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
