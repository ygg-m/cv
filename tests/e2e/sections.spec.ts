import { test, expect } from "@playwright/test";

test.describe("Sections", () => {
  test("TC-SEC-01 renders every section heading in English", async ({ page }) => {
    await page.goto("/");
    for (const name of ["About", "Skills", "Experience", "Education", "Certifications", "Contact"]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 1, name: "Ygor Goulart" })).toBeVisible();
  });

  test("TC-SEC-02 renders every section heading in Portuguese", async ({ page }) => {
    await page.goto("/?lang=pt-BR");
    for (const name of ["Sobre", "Habilidades", "Experiência", "Educação", "Certificações", "Contato"]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
    }
  });

  test("TC-SEC-03 shows only the QA-relevant roles as Visible Experience", async ({ page }) => {
    await page.goto("/");
    const jobs = page.locator('[data-list="experience"] > li');
    await expect(jobs).toHaveCount(3);
    await expect(jobs.nth(0)).toContainText("Senior QA Tester");
    await expect(jobs.nth(0)).toContainText("SIDE");
    await expect(jobs.nth(0)).toContainText("Dec 2025 – Present");
    await expect(jobs.nth(1)).toContainText("ACS Pro");
    await expect(jobs.nth(2)).toContainText("Concentrix");
    await expect(page.getByText("ACSoftware")).toBeHidden();
  });

  test("TC-SEC-04 shows the degree as in progress", async ({ page }) => {
    await page.goto("/");
    const degree = page.locator('[data-list="education"] > li');
    await expect(degree).toHaveCount(1);
    await expect(degree).toContainText("Bachelor's in Computer Science");
    await expect(degree).toContainText("In progress");
    await expect(degree).not.toContainText("2027");
  });

  test("TC-SEC-05 lists certifications, including hours when given", async ({ page }) => {
    await page.goto("/");
    const certs = page.locator('[data-list="certifications"] > li');
    await expect(certs).toHaveCount(2);
    await expect(certs.nth(0)).toContainText("Iterasys");
    await expect(certs.nth(1)).toContainText("112 hours");
  });

  test("TC-SEC-06 lists Core Skills first", async ({ page }) => {
    await page.goto("/");
    const core = page.locator('[data-skills="core"]');
    await expect(core).toContainText("Playwright");
    await expect(core).toContainText("Postman");
    await expect(core).toContainText("TestRail");
    await expect(page.locator('[data-skills="supporting"]')).toContainText("TypeScript");
    await expect(page.locator('[data-skills="spoken"]')).toContainText("Portuguese: Native");
    const coreBox = await core.boundingBox();
    const supportingBox = await page.locator('[data-skills="supporting"]').boundingBox();
    expect(coreBox!.y).toBeLessThan(supportingBox!.y);
  });

  test("TC-SEC-07 contact links point to email, LinkedIn and GitHub", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await expect(contact.getByRole("link", { name: "ygorgm95@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:ygorgm95@gmail.com",
    );
    await expect(contact.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", /^https:\/\/www\.linkedin\.com\//);
    await expect(contact.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/ygg-m");
  });

  test("TC-SEC-08 never exposes the phone number or birthday (privacy)", async ({ page }) => {
    for (const url of ["/", "/?lang=pt-BR"]) {
      await page.goto(url);
      const html = await page.content();
      expect(html).not.toMatch(/\+55|95283|1995/);
    }
  });

  test("TC-SEC-09 switching Locale re-renders the content", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch language to Portuguese" }).click();
    await expect(page.getByRole("heading", { level: 3, name: "Habilidades principais" })).toBeVisible();
    await expect(page.locator('[data-list="experience"] > li').first()).toContainText("QA Tester Sênior");
    await expect(page.locator('[data-list="experience"] > li').first()).toContainText("Atualmente");
  });

  test("TC-SEC-10 navigation links jump to their sections", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "Certifications" }).click();
    await expect(page).toHaveURL(/#certifications$/);
    await expect(page.locator("#certifications")).toBeInViewport();
  });

  test("TC-SEC-11 content is available without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();
    await expect(page.locator('[data-list="experience"] > li')).toHaveCount(3);
    await context.close();
  });

  test("TC-SEC-12 the page does not scroll horizontally on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const url of ["/", "/?lang=pt-BR"]) {
      await page.goto(url);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, url).toBeLessThanOrEqual(0);
    }
  });

  test("TC-SEC-13 company images load", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("#experience img, #education img");
    await expect(images).toHaveCount(4);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
  });
});
