import { describe, expect, it } from "vitest";
import cv from "../../src/content/cv.json";
import { formatPeriod, renderContent } from "../../src/render";

describe("formatPeriod", () => {
  it("TC-SEC-U1 formats month ranges per Locale, in UTC", () => {
    expect(formatPeriod("2025-01", "2025-07", "en")).toBe("Jan 2025 – Jul 2025");
    expect(formatPeriod("2025-01", "2025-07", "pt-BR")).toMatch(/^jan\.? de 2025 – jul\.? de 2025$/);
  });

  it("TC-SEC-U2 shows Present / Atualmente for an open end", () => {
    expect(formatPeriod("2025-12", null, "en")).toBe("Dec 2025 – Present");
    expect(formatPeriod("2025-12", null, "pt-BR")).toMatch(/– Atualmente$/);
  });

  it("TC-SEC-U3 keeps year-only starts as a year", () => {
    expect(formatPeriod("2010", null, "en")).toBe("2010 – Present");
  });
});

describe.each(["en", "pt-BR"] as const)("renderContent (%s)", (locale) => {
  const html = renderContent(locale);

  it("TC-SEC-U4 renders every section", () => {
    for (const id of ["about", "skills", "experience", "education", "certifications", "contact"]) {
      expect(html, id).toContain(`id="${id}"`);
    }
  });

  it("TC-SEC-U5 renders only Visible Experience and Visible Education", () => {
    const experienceIds = [...html.matchAll(/data-list="experience"[\s\S]*?<\/ul>\s*<\/section>/g)][0][0];
    for (const job of cv.experience) {
      const present = experienceIds.includes(`data-id="${job.id}"`);
      expect(present, job.id).toBe(job.visibility === "visible");
    }
    for (const item of cv.education) {
      expect(html.includes(`data-id="${item.id}"`), item.id).toBe(item.visibility === "visible");
    }
  });

  it("TC-SEC-U6 lists Core Skills before supporting skills", () => {
    expect(html.indexOf('data-skills="core"')).toBeGreaterThan(-1);
    expect(html.indexOf('data-skills="core"')).toBeLessThan(html.indexOf('data-skills="supporting"'));
  });

  it("TC-SEC-U7 never contains the phone number or a birthday", () => {
    expect(html).not.toContain(cv.pdfOnly.phone);
    expect(html).not.toMatch(/\+55|1995|95283/);
  });

  it("TC-SEC-U8 renders every certification with its issuer", () => {
    for (const cert of cv.certifications) {
      expect(html).toContain(cert.issuer);
      expect(html).toContain(cert.name[locale]);
    }
  });
});

describe("renderContent escaping", () => {
  it("TC-SEC-U9 produces different, Locale-specific text", () => {
    expect(renderContent("en")).toContain("Core skills");
    expect(renderContent("pt-BR")).toContain("Habilidades principais");
    expect(renderContent("pt-BR")).not.toContain("Core skills");
  });
});
