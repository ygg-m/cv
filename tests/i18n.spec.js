import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const enDictionary = JSON.parse(fs.readFileSync(path.join(root, "locales", "en.json"), "utf8"));
const ptDictionary = JSON.parse(fs.readFileSync(path.join(root, "locales", "pt.json"), "utf8"));

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalize(text) {
  return decodeEntities(text).trim().replace(/\s+/g, " ");
}

test("PT dictionary covers exactly the same keys as the EN dictionary", () => {
  const enKeys = Object.keys(enDictionary).sort();
  const ptKeys = Object.keys(ptDictionary).sort();

  const missingInPt = enKeys.filter((key) => !ptKeys.includes(key));
  const missingInEn = ptKeys.filter((key) => !enKeys.includes(key));

  expect(missingInPt, "keys without a PT translation").toEqual([]);
  expect(missingInEn, "PT keys that do not exist in EN").toEqual([]);

  const emptyValues = ptKeys.filter((key) => !String(ptDictionary[key]).trim());
  expect(emptyValues, "PT translations must not be empty").toEqual([]);
});

test("raw HTML content matches the EN dictionary", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();

  // Text nodes: leaf elements carrying a data-i18n key.
  const textMatches = [...html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)</g)];
  expect(textMatches.length, "expected plenty of translatable elements").toBeGreaterThan(50);

  const mismatches = [];
  for (const [, key, rawText] of textMatches) {
    const expected = enDictionary[key];
    const actual = normalize(rawText);
    if (expected === undefined) {
      mismatches.push(`en.json has no key "${key}"`);
    } else if (expected !== actual) {
      mismatches.push(
        `"${key}" differs:\n  en.json: ${JSON.stringify(expected)}\n  index.html: ${JSON.stringify(actual)}`,
      );
    }
  }
  expect(mismatches, "index.html and locales/en.json must stay in sync").toEqual([]);

  // Accessible names: aria-label before data-i18n-aria (project convention).
  const ariaMatches = [...html.matchAll(/aria-label="([^"]*)"[^>]*data-i18n-aria="([^"]+)"/g)];
  expect(ariaMatches.length, "expected at least one translatable aria-label").toBeGreaterThan(0);

  const ariaMismatches = [];
  for (const [, rawLabel, key] of ariaMatches) {
    const expected = enDictionary[key];
    const actual = decodeEntities(rawLabel);
    if (expected === undefined) {
      ariaMismatches.push(`en.json has no key "${key}"`);
    } else if (expected !== actual) {
      ariaMismatches.push(`"${key}" differs: ${JSON.stringify(expected)} vs ${JSON.stringify(actual)}`);
    }
  }
  expect(ariaMismatches).toEqual([]);
});

test("switching language re-renders every translated element", async ({ page }) => {
  await page.goto("/");
  await page.click('.lang-btn[data-lang="pt"]');
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

  const applied = await page.$$eval("[data-i18n]", (elements) =>
    elements.map((el) => ({
      key: el.dataset.i18n,
      text: el.textContent.trim().replace(/\s+/g, " "),
    })),
  );

  expect(applied.length).toBeGreaterThan(50);

  // Any element still showing its EN value would have a text != pt.json value
  // (except the handful of keys whose translation is intentionally identical).
  const notTranslated = applied.filter(({ key, text }) => ptDictionary[key] !== text);
  expect(
    notTranslated.map(({ key }) => key),
    "every data-i18n element must display the PT value after switching",
  ).toEqual([]);
});
