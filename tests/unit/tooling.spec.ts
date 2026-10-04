import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const { version } = JSON.parse(readFileSync("node_modules/@playwright/test/package.json", "utf8"));

describe("Visual test tooling (ADR 0003)", () => {
  it.each([".github/workflows/ci.yml", ".github/workflows/update-visual-baselines.yml"])(
    "TC-VIS-U1 %s uses the Playwright image matching the installed version",
    (file) => {
      const yaml = readFileSync(file, "utf8");
      const tags = [...yaml.matchAll(/mcr\.microsoft\.com\/playwright:v([\d.]+)-noble/g)].map((m) => m[1]);
      expect(tags.length).toBeGreaterThan(0);
      expect(new Set(tags)).toEqual(new Set([version]));
    },
  );

  it("TC-VIS-U2 the deploy job waits for both the functional and the visual jobs (ADR 0002)", () => {
    const yaml = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(yaml).toMatch(/needs:\s*\[test,\s*visual\]/);
  });
});

describe("Testing section honesty", () => {
  it("TC-TST-U1 the tools named on the page are installed and the workflows exist", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const dev = Object.keys(pkg.devDependencies);
    for (const dependency of ["@playwright/test", "@axe-core/playwright", "vitest", "ajv"]) {
      expect(dev, dependency).toContain(dependency);
    }
    expect(existsSync(".github/workflows/ci.yml")).toBe(true);
  });
});
