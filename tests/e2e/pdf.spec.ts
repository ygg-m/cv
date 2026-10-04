import { PDFParse } from "pdf-parse";
import { test, expect, type APIRequestContext } from "@playwright/test";

async function readPdf(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.status(), path).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  const parser = new PDFParse({ data: new Uint8Array(await response.body()) });
  try {
    const result = await parser.getText();
    return { text: result.text, pages: result.total };
  } finally {
    await parser.destroy();
  }
}

test.describe("Download CV", () => {
  test("TC-PDF-01 the button points at the PDF for the active Locale", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "cv/Ygor-Goulart-CV-en.pdf");
    await page.goto("/?lang=pt-BR");
    await expect(page.getByRole("link", { name: "Baixar CV" })).toHaveAttribute("href", "cv/Ygor-Goulart-CV-pt-BR.pdf");
  });

  test("TC-PDF-02 clicking the button downloads the PDF", async ({ page }) => {
    await page.goto("/?lang=pt-BR");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Baixar CV" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("Ygor-Goulart-CV-pt-BR.pdf");
  });

  test("TC-PDF-03 the English PDF is a short, complete CV including the phone number", async ({ request }) => {
    const { text, pages } = await readPdf(request, "/cv/Ygor-Goulart-CV-en.pdf");
    expect(pages).toBeLessThanOrEqual(2);
    for (const expected of [
      "Ygor Goulart",
      "QA Tester",
      "Test Automation",
      "ygorgm95@gmail.com",
      "+55 (11) 95283-1030",
      "Senior QA Tester",
      "Bachelor's in Computer Science",
      "Quality Assurance (QA) Certification",
      "Playwright",
      "Portuguese: Native",
    ]) {
      expect(text, expected).toContain(expected);
    }
  });

  test("TC-PDF-04 the Portuguese PDF is fully localized and includes the phone number", async ({ request }) => {
    const { text } = await readPdf(request, "/cv/Ygor-Goulart-CV-pt-BR.pdf");
    for (const expected of ["Automação de Testes", "EXPERIÊNCIA", "CERTIFICAÇÕES", "Em andamento", "+55 (11) 95283-1030"]) {
      expect(text, expected).toContain(expected);
    }
    expect(text).not.toContain("Experience");
  });

  test("TC-PDF-05 the PDFs hold only QA-relevant Visible entries, like the web page", async ({ request }) => {
    for (const locale of ["en", "pt-BR"]) {
      const { text } = await readPdf(request, `/cv/Ygor-Goulart-CV-${locale}.pdf`);
      for (const company of ["SIDE", "ACS Pro", "Concentrix"]) expect(text, company).toContain(company);
      for (const hidden of ["Idea Maker", "LIQ", "Planned Acts of Kindness", "ACSoftware"]) {
        expect(text, hidden).not.toContain(hidden);
      }
    }
  });

  test("TC-PDF-06 the phone number is in the PDFs but never in the web page", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).not.toMatch(/95283|\+55/);
  });
});
