# Test strategy

How quality is assured for the CV Site. Terms follow [GLOSSARY.md](../../GLOSSARY.md); the detailed scope and
schedule are in the [test plan](test-plan.md), and every automated check is listed in
[test-cases.md](test-cases.md).

## Objectives

1. A visitor, in either Locale and either Theme, sees accurate, readable, accessible content on any common
   device.
2. Nothing private ships: no birthday, and no phone number on the web page.
3. A broken change cannot be published: the Test Suite gates deployment ([ADR 0002](../adr/0002-tests-gate-deployment.md)).
4. The suite is itself evidence of testing skill, so it favours **consistency over volume**: few, deterministic,
   well-named checks over many flaky ones.

## Risk-based priorities

| Risk | Impact | Where it is tested |
| --- | --- | --- |
| Private data leaks into the page or bundle | High | Schema rejects extra fields; the phone number lives in a section the web bundle never imports; E2E and unit checks scan the HTML and the bundle (R8) |
| A translation is missing or stale | High for a bilingual CV | Schema requires both Locales for every text; content and render tests (R1, R2) |
| Unreadable colors in one Theme | High | Contrast computed from the design tokens, plus axe on every Theme and Locale (R3, R6) |
| Layout regressions nobody notices | Medium | Screenshot baselines in a fixed container (R7) |
| Dead links and slow pages as the web changes | Medium | Nightly link crawl and Lighthouse budgets (R11, R12) |
| The tests quietly stop testing | Medium | Control tests: axe must catch injected defects; documentation is generated from the tests |

## Test levels and tools

| Level | Tool | What it covers |
| --- | --- | --- |
| Unit and content | Vitest, Ajv (JSON Schema) | Content Source rules, Locale and Theme resolution, color contrast, PDF layout, link helpers, tooling invariants |
| Functional end-to-end | Playwright on Chromium, Firefox, WebKit | User flows: Locale and Theme switching, sections, modals, downloads, persistence, storage failures |
| Accessibility | axe-core via Playwright | WCAG 2.1 A/AA and best-practice rules across Theme × Locale, with and without open modals; keyboard and focus checks |
| Visual regression | Playwright screenshots in the official Docker image | Theme × Locale × viewport, plus each modal ([ADR 0003](../adr/0003-visual-tests-run-in-docker.md)) |
| Performance and SEO | Lighthouse CI (nightly) | Category budgets for performance, accessibility, best practices, SEO |
| Links | Own crawler (nightly) | Every external link, internal files and in-page anchors |
| Manual / exploratory | Browser and assistive-technology spot checks | Reading order, screen-reader announcements, anything a rule cannot judge |

Cypress and Selenium are out of scope here and reserved for later projects.

## Test design principles

- **Deterministic first.** No sleeps; assertions wait on state. Dates are formatted in UTC. The live CI badge is
  replaced by a fixed image in screenshots. Anything that depends on the network is nightly, not per commit.
- **Test the contract, not the implementation.** Locators use roles and accessible names, so the markup can
  change without breaking tests, and the tests double as accessibility checks.
- **Every check has an ID.** `TC-<AREA>-<n>` appears in the test title and in
  [test-cases.md](test-cases.md); a unit test fails when the document is out of date.
- **Prove the checks can fail.** Negative tests mutate valid content to make sure invalid input is rejected,
  and the accessibility scan is verified against injected defects.
- **Both Locales, both Themes.** Anything user-visible is exercised in the combinations a visitor can reach.

## Environments

- **Local:** Windows, Node 22, Chromium for quick runs; visual tests only through Docker.
- **CI:** GitHub Actions on Ubuntu; functional tests on three browsers; visual tests in the Playwright image.
- **Production:** GitHub Pages, deployed from `main` only after every job passes.

## Entry and exit criteria

- **Entry (per change):** the branch builds, lints and type-checks.
- **Exit / release gate:** all unit, E2E, accessibility and visual checks pass in CI. Nightly results are
  reviewed the next morning; a red nightly blocks the next release until triaged.

## Defect management

Bugs are GitHub Issues created from the [bug report template](../../.github/ISSUE_TEMPLATE/bug_report.yml),
labelled `bug` plus one severity:

| Label | Meaning |
| --- | --- |
| `severity-critical` | Private data exposed, page unusable, or deploy broken |
| `severity-major` | A requirement fails for a whole Locale, Theme or browser |
| `severity-minor` | Cosmetic or limited-scope defect with a workaround |
| `severity-trivial` | Typo-level polish |

A fixed bug gets a regression test whose title carries a test-case ID, and the issue links to the commit that
fixes it and the test that guards it.

## Metrics

Reported from CI, not hand-maintained: tests per requirement ([test-cases.md](test-cases.md)), pass rate per
browser (Playwright report), Lighthouse category scores, and open bugs by severity.
