import { describe, expect, it } from "vitest";
import cv from "../../src/content/cv.json";
import { pdfFileName, renderCvDocument } from "../../src/render-pdf";

const escaped = (value: string) => value.replace(/&/g, "&amp;");

describe.each(["en", "pt-BR"] as const)("renderCvDocument (%s)", (locale) => {
  const html = renderCvDocument(locale);

  it("TC-PDF-U1 declares the document language", () => {
    expect(html).toContain(`<html lang="${locale}">`);
  });

  it("TC-PDF-U2 includes the phone number, unlike the web page", () => {
    expect(html).toContain(cv.pdfOnly.phone);
  });

  it("TC-PDF-U3 includes only Visible experience and education", () => {
    for (const job of cv.experience) {
      expect(html.includes(job.company), job.company).toBe(job.visibility === "visible");
    }
    for (const study of cv.education.filter((e) => e.visibility === "more")) {
      expect(html).not.toContain(study.title[locale]);
    }
  });

  it("TC-PDF-U4 includes every skill group and certification", () => {
    for (const group of cv.skills) expect(html).toContain(escaped(group.name[locale]));
    for (const cert of cv.certifications) expect(html).toContain(escaped(cert.name[locale]));
  });
});

describe("pdfFileName", () => {
  it("TC-PDF-U5 names one file per Locale", () => {
    expect(pdfFileName("en")).toBe("Ygor-Goulart-CV-en.pdf");
    expect(pdfFileName("pt-BR")).toBe("Ygor-Goulart-CV-pt-BR.pdf");
  });
});
