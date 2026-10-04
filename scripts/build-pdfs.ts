// Generates the downloadable CV PDFs (one per Locale) into dist/cv/ from the Content Source.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { LOCALES } from "../src/i18n";
import { pdfFileName, renderCvDocument } from "../src/render-pdf";

const outDir = "dist/cv";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const locale of LOCALES) {
    await page.setContent(renderCvDocument(locale));
    await page.pdf({ path: `${outDir}/${pdfFileName(locale)}`, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(`wrote ${outDir}/${pdfFileName(locale)}`);
  }
} finally {
  await browser.close();
}
