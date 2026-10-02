import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SCENARIOS = [
  { lang: "en", theme: "dark" },
  { lang: "en", theme: "light" },
  { lang: "pt", theme: "dark" },
  { lang: "pt", theme: "light" },
];

for (const { lang, theme } of SCENARIOS) {
  test(`axe: no WCAG A/AA violations on ${lang} × ${theme}`, async ({ page }) => {
    await page.addInitScript((storedTheme) => localStorage.setItem("theme", storedTheme), theme);
    await page.goto(lang === "en" ? "/" : "/?lang=pt");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

    // Expand every progressive-disclosure group so hidden content is scanned too.
    for (const button of await page.locator(".more-toggle").all()) {
      await button.click();
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const violations = results.violations.map(
      (violation) =>
        `${violation.id}: ${violation.help} — ${violation.nodes.length} node(s), first: ${violation.nodes[0]?.target?.join(" ")}`,
    );

    expect(violations, `accessibility violations on lang=${lang}, theme=${theme}`).toEqual([]);
  });
}
