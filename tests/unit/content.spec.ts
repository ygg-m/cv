import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import cv from "../../src/content/cv.json";
import schema from "../../src/content/cv.schema.json";

const validate = new Ajv2020({ allErrors: true, strict: true, strictRequired: false }).compile(schema);
// Tests mutate arbitrary fields to build invalid documents, so the clone is deliberately untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clone = () => structuredClone(cv) as Record<string, any>;
const isValid = (data: unknown) => validate(data) === true;

describe("Content Source", () => {
  it("TC-CON-01 conforms to the schema", () => {
    expect(isValid(cv), JSON.stringify(validate.errors)).toBe(true);
  });

  it("TC-CON-02 rejects a missing translation", () => {
    const data = clone();
    delete data.profile.about["pt-BR"];
    expect(isValid(data)).toBe(false);
  });

  it("TC-CON-03 rejects an empty translation", () => {
    const data = clone();
    data.experience[0].role.en = "";
    expect(isValid(data)).toBe(false);
  });

  it("TC-CON-04 accepts an in-progress degree without an end date", () => {
    expect(cv.education[0].status).toBe("in-progress");
    expect(cv.education[0]).not.toHaveProperty("expectedEnd");
    expect(isValid(cv)).toBe(true);
  });

  it("TC-CON-05 accepts a year-only start for ongoing experience", () => {
    const freelance = cv.experience.find((e) => e.id === "freelance");
    expect(freelance).toMatchObject({ start: "2010", end: null });
  });

  it("TC-CON-06 rejects personal data the site must not hold (birthday)", () => {
    const data = clone();
    data.profile.birthday = "1995-08-03";
    expect(isValid(data)).toBe(false);
  });

  it("TC-CON-07 keeps the phone number only under contact.pdfOnly", () => {
    const { pdfOnly, ...publicContact } = cv.contact;
    const publicData = JSON.stringify({ ...cv, contact: publicContact });
    expect(pdfOnly.phone).toBeTruthy();
    expect(publicData).not.toContain(pdfOnly.phone);
    expect(publicData).not.toMatch(/\+\d{2}\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  });

  it("TC-CON-08 uses unique ids within each collection", () => {
    for (const key of ["experience", "education", "certifications", "skills", "devProjects"] as const) {
      const ids = cv[key].map((item) => item.id);
      expect(new Set(ids).size, key).toBe(ids.length);
    }
  });

  it("TC-CON-09 references image files that exist", () => {
    const images = [...cv.experience, ...cv.education, ...cv.devProjects].map((item) => item.image);
    const missing = images.filter((image) => !existsSync(resolve("src/assets", image)));
    expect(missing).toEqual([]);
  });

  it("TC-CON-10 keeps QA-relevant experience visible and the rest under More", () => {
    const visible = cv.experience.filter((e) => e.visibility === "visible").map((e) => e.id);
    expect(visible).toEqual(["side", "acs-pro", "concentrix"]);
    expect(cv.experience.some((e) => e.visibility === "more")).toBe(true);
  });
});
