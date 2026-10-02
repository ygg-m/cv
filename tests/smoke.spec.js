import { expect, test } from "@playwright/test";

const CRITICAL_LINKS = [
  "mailto:ygorgm95@gmail.com",
  "https://github.com/ygg-m",
  "https://drive.google.com/file/d/1Xzh1LSBM64ZnpV27amtfwdE3Ylkr3w-9/view?usp=share_link",
  "https://www.linkedin.com/in/ygorgm/",
  "https://www.instagram.com/ygglart/",
  "https://api.whatsapp.com/send?phone=5511952831030",
];

const LOCAL_HOST = "http://127.0.0.1:4173";

test("loads with no console errors or failed local requests", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("response", (response) => {
    if (response.url().startsWith(LOCAL_HOST) && response.status() >= 400) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(errors, "the page must be free of console errors and 4xx/5xx responses").toEqual([]);
});

test("defaults to English when no preference is stored", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".hero-role")).toHaveText("QA & Automation Engineer");
  await expect(page.locator("#Profile h2")).toHaveText("Profile");

  const stored = await page.evaluate(() => localStorage.getItem("lang"));
  expect(stored, "viewing the default language must not write a preference").toBeNull();
  expect(new URL(page.url()).searchParams.get("lang")).toBeNull();
});

test("language toggle switches to PT-BR and the preference survives a reload", async ({ page }) => {
  await page.goto("/");

  await page.click('.lang-btn[data-lang="pt"]');

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("#Profile h2")).toHaveText("Perfil");
  await expect(page.locator(".hero-tagline")).toHaveText("Encontre o bug antes do jogador.");
  expect(new URL(page.url()).searchParams.get("lang"), "URL must be shareable in PT").toBe("pt");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("#Profile h2")).toHaveText("Perfil");

  // Switching back returns to English and removes the URL parameter.
  await page.click('.lang-btn[data-lang="en"]');
  await expect(page.locator("#Profile h2")).toHaveText("Profile");
  expect(new URL(page.url()).searchParams.has("lang")).toBe(false);
});

test("?lang=pt wins over the stored preference without overwriting it", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "en"));

  await page.goto("/?lang=pt");

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("#Profile h2")).toHaveText("Perfil");

  const stored = await page.evaluate(() => localStorage.getItem("lang"));
  expect(stored, "a shared link must not hijack the visitor's stored preference").toBe("en");
});

test("follows the OS color scheme on the first visit", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("theme toggle persists in both directions across reloads", async ({ page }) => {
  await page.goto("/");
  const initial = await page.locator("html").getAttribute("data-theme");
  const flipped = initial === "dark" ? "light" : "dark";

  await page.click(".theme-toggle");
  await expect(page.locator("html")).toHaveAttribute("data-theme", flipped);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", flipped);

  await page.click(".theme-toggle");
  await expect(page.locator("html")).toHaveAttribute("data-theme", initial);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", initial);
});

test("every nav anchor targets an existing section and scrolls to it", async ({ page }) => {
  await page.goto("/");

  const hrefs = await page.$$eval('a[href^="#"]', (links) =>
    links.map((link) => link.getAttribute("href")),
  );
  expect(hrefs.length, "the page must expose anchor navigation").toBeGreaterThan(5);

  for (const href of hrefs) {
    const id = href.slice(1);
    await expect(page.locator(`#${id}`), `anchor ${href} has no target element`).toHaveCount(1);
  }

  await page.click('.nav-links a[href="#Projects"]');
  await expect(page.locator("#Projects")).toBeInViewport();
});

test("critical contact and resume links are present", async ({ page }) => {
  await page.goto("/");
  for (const href of CRITICAL_LINKS) {
    await expect(page.locator(`a[href="${href}"]`), `missing link: ${href}`).not.toHaveCount(0);
  }
});

test('"More" buttons reveal the pre-pivot content', async ({ page }) => {
  await page.goto("/");

  const careerMore = page.locator('.more-toggle[aria-controls="career-more"]');
  await expect(page.locator("#career-more")).toBeHidden();

  await careerMore.click();
  await expect(page.locator("#career-more")).toBeVisible();
  await expect(careerMore).toHaveAttribute("aria-expanded", "true");
  await expect(careerMore).toHaveText("Show less");
  await expect(page.locator("#career-more .career-item")).toHaveCount(2);

  await careerMore.click();
  await expect(page.locator("#career-more")).toBeHidden();
  await expect(careerMore).toHaveAttribute("aria-expanded", "false");
});
