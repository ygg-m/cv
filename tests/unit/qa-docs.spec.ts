import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AREAS, REQUIREMENTS, buildTestCasesDoc, collectCases } from "../../scripts/test-cases";

const normalize = (text: string) => text.replace(/\r\n/g, "\n");

describe("QA documentation", () => {
  it("TC-DOC-U1 test-cases.md is generated from the current tests (run `npm run docs:test-cases`)", () => {
    expect(normalize(readFileSync("docs/qa/test-cases.md", "utf8"))).toBe(normalize(buildTestCasesDoc()));
  });

  it("TC-DOC-U2 every test case belongs to a documented area", () => {
    const unknown = collectCases().filter((c) => !AREAS[c.area]);
    expect(unknown.map((c) => c.id)).toEqual([]);
  });

  it("TC-DOC-U3 every requirement in the test plan has at least one automated case", () => {
    const doc = normalize(readFileSync("docs/qa/test-cases.md", "utf8"));
    for (const id of Object.keys(REQUIREMENTS)) {
      const row = doc.split("\n").find((line) => line.startsWith(`| ${id} |`));
      expect(row, id).toBeDefined();
      expect(Number(row!.split("|")[3]), `${id} has no test cases`).toBeGreaterThan(0);
    }
  });

  it("TC-DOC-U4 the test plan lists the same requirements as the generator", () => {
    const plan = readFileSync("docs/qa/test-plan.md", "utf8");
    for (const id of Object.keys(REQUIREMENTS)) {
      expect(plan, id).toMatch(new RegExp(`\\| ${id} \\|`));
    }
  });

  it("TC-DOC-U5 test case IDs are unique per title prefix (no duplicate IDs across files)", () => {
    const ids = collectCases().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("TC-DOC-U6 the bug report template exists and defines severity", () => {
    const template = readFileSync(".github/ISSUE_TEMPLATE/bug_report.yml", "utf8");
    expect(template).toContain("labels: [bug, needs-triage]");
    expect(template).toContain("id: severity");
    expect(template).toContain("id: steps");
  });
});
