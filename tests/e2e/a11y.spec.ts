import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];
const themes = ["dark", "light"] as const;
const locales = [
  { name: "English", query: "" },
  { name: "Portuguese", query: "?lang=pt-BR" },
];
const dialogs = [
  { button: /^(More experience|Mais experiências)$/, name: "more experience" },
  { button: /^(More education|Mais formação)$/, name: "more education" },
  { button: /^(Dev Projects|Projetos de Desenvolvimento)$/, name: "dev projects" },
];

async function open(page: Page, theme: string, query: string) {
  await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
  await page.goto(`/${query}`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

async function violations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    targets: v.nodes.map((n) => n.target.join(" ")),
  }));
}

test.describe("Accessibility (axe, WCAG 2.1 AA + best practices)", () => {
  for (const theme of themes) {
    for (const locale of locales) {
      test(`TC-A11Y-01 page has no violations: ${theme} theme, ${locale.name}`, async ({ page }) => {
        await open(page, theme, locale.query);
        expect(await violations(page)).toEqual([]);
      });

      for (const dialog of dialogs) {
        test(`TC-A11Y-02 ${dialog.name} modal has no violations: ${theme} theme, ${locale.name}`, async ({ page }) => {
          await open(page, theme, locale.query);
          await page.getByRole("button", { name: dialog.button }).first().click();
          await expect(page.getByRole("dialog")).toBeVisible();
          expect(await violations(page)).toEqual([]);
        });
      }
    }
  }

  test("TC-A11Y-03 the document declares its language and follows the Locale", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/?lang=pt-BR");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("TC-A11Y-04 headings form a single-h1 outline without skipped levels", async ({ page }) => {
    await page.goto("/");
    const levels = await page.locator("main h1, main h2, main h3, main h4").evaluateAll((els) =>
      els.map((el) => Number(el.tagName[1])),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    levels.reduce((previous, current) => {
      expect(current - previous, `heading level ${previous} -> ${current}`).toBeLessThanOrEqual(1);
      return current;
    }, 1);
  });

  test("TC-A11Y-05 the skip link is the first focusable element and reaches the main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("TC-A11Y-06 every interactive control shows a visible focus indicator", async ({ page }) => {
    await page.goto("/");
    const controls = page.locator("a[href], button");
    const count = await controls.count();
    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);
      if (!(await control.isVisible())) continue;
      await control.focus();
      const outline = await control.evaluate((el) => {
        const style = getComputedStyle(el);
        return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
      });
      expect(outline.style, await control.innerText()).not.toBe("none");
      expect(outline.width).toBeGreaterThan(0);
    }
  });

  test("TC-A11Y-07 content reflows to a 320px viewport without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("TC-A11Y-08 respects the reduced-motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  });

  test("TC-A11Y-09 the scanner detects injected defects (control for the zero-violation results)", async ({ page }) => {
    await open(page, "light", "");
    await page.evaluate(() => {
      document.querySelector("main")!.insertAdjacentHTML(
        "beforeend",
        '<p style="color:#cccccc;background:#ffffff">low contrast</p><img src="assets/projects/todo.png">',
      );
    });
    const rules = (await violations(page)).map((v) => v.rule);
    expect(rules).toContain("color-contrast");
    expect(rules).toContain("image-alt");
  });
});
