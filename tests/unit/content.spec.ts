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

  it("TC-CON-04 requires an expected end for an in-progress education entry", () => {
    const data = clone();
    delete data.education[0].expectedEnd;
    expect(data.education[0].status).toBe("in-progress");
    expect(isValid(data)).toBe(false);
  });

  it("TC-CON-05 rejects an expected end on a completed education entry", () => {
    const data = clone();
    data.education[0].status = "completed";
    expect(isValid(data)).toBe(false);
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
