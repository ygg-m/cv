import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseTheme, resolveTheme } from "../../src/theme";

describe("Theme resolution", () => {
  it("TC-THM-U1 defaults to dark when there is no stored choice and no light OS preference", () => {
    expect(resolveTheme(null, false)).toBe("dark");
  });

  it("TC-THM-U2 follows a light OS preference when there is no stored choice", () => {
    expect(resolveTheme(null, true)).toBe("light");
  });

  it("TC-THM-U3 a stored choice beats the OS preference", () => {
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("light", false)).toBe("light");
  });

  it("TC-THM-U4 ignores invalid stored values", () => {
    expect(parseTheme("blue")).toBeNull();
    expect(parseTheme("")).toBeNull();
    expect(resolveTheme("blue", true)).toBe("light");
    expect(resolveTheme("blue", false)).toBe("dark");
  });

  it("TC-THM-U5 the inline pre-paint script agrees with resolveTheme in every case", () => {
    const html = readFileSync("index.html", "utf8");
    const code = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(code, "inline script not found in index.html").toBeTruthy();

    const stores: (string | null)[] = [null, "dark", "light", "blue", "throws"];
    for (const stored of stores) {
      for (const osLight of [true, false]) {
        const documentElement = { dataset: {} as Record<string, string> };
        const localStorage = {
          getItem() {
            if (stored === "throws") throw new Error("blocked");
            return stored;
          },
        };
        const window = { matchMedia: () => ({ matches: osLight }) };
        new Function("window", "document", "localStorage", code!)(window, { documentElement }, localStorage);
        const expected = resolveTheme(stored === "throws" ? null : stored, osLight);
        expect(documentElement.dataset.theme, `stored=${stored} osLight=${osLight}`).toBe(expected);
      }
    }
  });
});

// WCAG 2.x contrast, computed from the design tokens declared in src/style.css.
const css = readFileSync("src/style.css", "utf8").replace(/\r\n/g, "\n");

function tokens(selector: string): Record<string, string> {
  const block = css.split(selector)[1]?.split("}")[0] ?? "";
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6});/g)].map((m) => [m[1], m[2]]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground token, background token, minimum ratio, why]
const PAIRS: [string, string, number, string][] = [
  ["text", "bg", 4.5, "body text"],
  ["text", "surface", 4.5, "text on cards and buttons"],
  ["text-muted", "bg", 4.5, "secondary text"],
  ["text-muted", "surface", 4.5, "secondary text on cards"],
  ["primary-text", "bg", 4.5, "purple text"],
  ["primary-text", "surface", 4.5, "purple text on cards"],
  ["accent-text", "bg", 4.5, "amber text"],
  ["accent-text", "surface", 4.5, "amber text on cards"],
  ["on-primary", "primary", 4.5, "text on purple fills"],
  ["on-accent", "accent", 4.5, "text on amber fills"],
  ["border-strong", "bg", 3, "control borders (non-text, 3:1)"],
  ["primary", "bg", 3, "purple fills as UI components (3:1)"],
  ["focus", "bg", 3, "focus ring (3:1)"],
];

describe.each([
  ["dark", ':root,\n:root[data-theme="dark"] {'],
  ["light", ':root[data-theme="light"] {'],
])("Color tokens: %s theme", (_name, selector) => {
  const t = tokens(selector);

  it("TC-THM-U6 declares every token", () => {
    for (const [fg, bg] of PAIRS) {
      expect(t[fg], fg).toBeDefined();
      expect(t[bg], bg).toBeDefined();
    }
  });

  it.each(PAIRS)("TC-THM-U7 %s on %s meets %s:1 (%s)", (fg, bg, min) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
  });
});

describe("Amber accent usage", () => {
  it("TC-A11Y-U1 uses the raw amber token only as a background fill (it fails AA as text on light)", () => {
    const uses = [...css.matchAll(/([\w-]+):\s*[^;{}]*var\(--accent\)/g)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    expect(uses.every((property) => property === "background")).toBe(true);
  });
});
