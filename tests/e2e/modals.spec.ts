import { test, expect } from "@playwright/test";

test.describe("Modals", () => {
  test("TC-MOD-01 More experience lists the older roles", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "More experience" }).click();
    const dialog = page.getByRole("dialog", { name: "More experience" });
    await expect(dialog).toBeVisible();
    const jobs = dialog.locator("[data-list='more-experience'] > li");
    await expect(jobs).toHaveCount(5);
    for (const company of ["ACSoftware", "Planned Acts of Kindness", "Idea Maker", "LIQ", "Freelance"]) {
      await expect(dialog).toContainText(company);
    }
    await expect(dialog).toContainText("2010 – Present");
  });

  test("TC-MOD-02 More education lists the design background and courses", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More education" }).click();
    const dialog = page.getByRole("dialog", { name: "More education" });
    await expect(dialog.locator("[data-list='more-education'] > li")).toHaveCount(5);
    await expect(dialog).toContainText("10 years in graphic design");
    for (const school of ["Udemy", "Curso em Vídeo", "Scrimba"]) {
      await expect(dialog).toContainText(school);
    }
  });

  test("TC-MOD-03 Dev Projects lists every project with working links", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dev Projects" }).click();
    const dialog = page.getByRole("dialog", { name: "Dev Projects" });
    await expect(dialog.locator("[data-list='dev-projects'] > li")).toHaveCount(6);
    await expect(dialog.getByRole("link", { name: "GitHub: Pokédex" })).toHaveAttribute(
      "href",
      "https://github.com/ygg-m/js-pokedex",
    );
    await expect(dialog.getByRole("link", { name: "Live demo: Pokédex" })).toHaveAttribute("target", "_blank");
    for (const link of await dialog.locator("a[target=_blank]").all()) {
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("TC-MOD-04 Escape closes the modal and returns focus to the opener", async ({ page }) => {
    await page.goto("/");
    const opener = page.getByRole("button", { name: "More experience" });
    await opener.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("TC-MOD-05 the Close button closes the modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dev Projects" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Dev Projects" })).toBeFocused();
  });

  test("TC-MOD-06 clicking the backdrop closes the modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More education" }).click();
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("TC-MOD-07 keyboard focus never reaches the page behind an open modal", async ({ page }) => {
    // A native modal <dialog> makes the page inert; Tab may leave to the browser UI (body) but never
    // lands on the header, main content or footer.
    await page.goto("/");
    await page.getByRole("button", { name: "Dev Projects" }).click();
    const dialog = page.getByRole("dialog");
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body);
      expect(inside, `Tab press ${i + 1}`).toBe(true);
    }
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Shift+Tab");
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body);
      expect(inside, `Shift+Tab press ${i + 1}`).toBe(true);
    }
  });

  test("TC-MOD-08 the page behind an open modal does not scroll", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More experience" }).click();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("visible");
  });

  test("TC-MOD-09 labels and content are localized in Portuguese", async ({ page }) => {
    await page.goto("/?lang=pt-BR");
    await page.getByRole("button", { name: "Mais experiências" }).click();
    const dialog = page.getByRole("dialog", { name: "Mais experiências" });
    await expect(dialog).toContainText("Agente de BI");
    await expect(dialog.getByRole("button", { name: "Fechar" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Projetos de Desenvolvimento" }).click();
    await expect(page.getByRole("dialog", { name: "Projetos de Desenvolvimento" })).toContainText(
      "Aplicativo de tarefas com autenticação",
    );
  });

  test("TC-MOD-10 a modal fits a phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.getByRole("button", { name: "Dev Projects" }).click();
    const box = await page.getByRole("dialog").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    expect(box!.y + box!.height).toBeLessThanOrEqual(667);
  });

  test("TC-MOD-11 the More buttons expose which section they extend", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#experience").getByRole("button", { name: "More experience" })).toHaveText("More");
    await expect(page.locator("#education").getByRole("button", { name: "More education" })).toHaveText("More");
  });
});
