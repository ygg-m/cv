import { describe, expect, it } from "vitest";
import { getText, parseLocale, resolveLocale } from "../../src/i18n";

describe("Locale resolution", () => {
  it("TC-LOC-U1 normalizes supported language tags", () => {
    expect(parseLocale("pt-BR")).toBe("pt-BR");
    expect(parseLocale("pt-br")).toBe("pt-BR");
    expect(parseLocale("pt")).toBe("pt-BR");
    expect(parseLocale("en-US")).toBe("en");
    expect(parseLocale("EN")).toBe("en");
  });

  it("TC-LOC-U2 rejects unsupported or empty values", () => {
    expect(parseLocale("fr")).toBeNull();
    expect(parseLocale("")).toBeNull();
    expect(parseLocale(null)).toBeNull();
    expect(parseLocale(undefined)).toBeNull();
  });

  it("TC-LOC-U3 defaults to English", () => {
    expect(resolveLocale("", null)).toBe("en");
  });

  it("TC-LOC-U4 prefers the query string over the stored choice", () => {
    expect(resolveLocale("?lang=en", "pt-BR")).toBe("en");
    expect(resolveLocale("?lang=pt-BR", "en")).toBe("pt-BR");
  });

  it("TC-LOC-U5 falls back to the stored choice, then to the default, on invalid input", () => {
    expect(resolveLocale("", "pt-BR")).toBe("pt-BR");
    expect(resolveLocale("?lang=fr", "pt-BR")).toBe("pt-BR");
    expect(resolveLocale("?lang=fr", "xx")).toBe("en");
  });
});

describe("Text lookup", () => {
  it("TC-LOC-U6 returns text for the requested Locale", () => {
    expect(getText("profile.headline.subtitle", "en")).toBe("Test Automation");
    expect(getText("profile.headline.subtitle", "pt-BR")).toBe("Automação de Testes");
  });

  it("TC-LOC-U7 throws for an unknown path", () => {
    expect(() => getText("profile.nope", "en")).toThrow(/Missing text/);
  });
});
