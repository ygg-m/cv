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

  it("TC-SEC-U5 lists Visible entries on the page and More entries only inside the More dialogs", () => {
    const main = html.slice(0, html.indexOf("</main>"));
    const dialogs = html.slice(html.indexOf("</main>"));
    for (const entry of [...cv.experience, ...cv.education]) {
      const marker = `data-id="${entry.id}"`;
      expect(main.includes(marker), `${entry.id} in main`).toBe(entry.visibility === "visible");
      expect(dialogs.includes(marker), `${entry.id} in dialogs`).toBe(entry.visibility === "more");
    }
  });

  it("TC-SEC-U10 renders every Dev Project with its GitHub link inside the Dev Projects dialog", () => {
    const dialogs = html.slice(html.indexOf("</main>"));
    for (const project of cv.devProjects) {
      expect(dialogs).toContain(`data-id="${project.id}"`);
      expect(dialogs).toContain(project.github);
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
