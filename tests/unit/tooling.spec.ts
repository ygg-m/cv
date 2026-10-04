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

describe("Nightly checks (ADR 0002 gate stays fast; slow checks run on a schedule)", () => {
  const yaml = readFileSync(".github/workflows/nightly.yml", "utf8");

  it("TC-NGT-U1 runs on a schedule and can be started by hand", () => {
    expect(yaml).toMatch(/schedule:\s*\n\s*- cron:/);
    expect(yaml).toContain("workflow_dispatch:");
  });

  it("TC-NGT-U2 runs both Lighthouse and the link checker", () => {
    expect(yaml).toContain("npm run lighthouse");
    expect(yaml).toContain("npm run check:links");
  });

  it("TC-NGT-U3 Lighthouse enforces budgets for all four categories", () => {
    const config = JSON.parse(readFileSync("lighthouserc.json", "utf8"));
    const assertions = config.ci.assert.assertions;
    for (const category of ["performance", "accessibility", "best-practices", "seo"]) {
      const [level, options] = assertions[`categories:${category}`];
      expect(level, category).toBe("error");
      expect(options.minScore, category).toBeGreaterThanOrEqual(0.9);
    }
  });
});
