# Test plan

Scope, approach and schedule for testing the CV Site. The overall approach is in the
[test strategy](strategy.md); the list of automated cases is in [test-cases.md](test-cases.md).

## Items under test

The built site (`dist/`): one `index.html` with inlined CSS and JS, images under `assets/`, and two generated
PDFs under `cv/`. Source of truth for content: `src/content/cv.json`.

## Features and requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| R1 | Content integrity | The content validates against its schema; every text exists in English and Portuguese; ids are unique; referenced images exist |
| R2 | Locale | English by default; `?lang=pt-BR` renders Portuguese; the toggle switches, updates the URL and persists; invalid values fall back to English; blocked storage does not break the page |
| R3 | Theme | OS preference decides, dark when it cannot be read; the toggle switches and persists over the OS; the Theme is set before first paint; all token pairs meet AA contrast |
| R4 | Sections | Hero, About, Skills (Core first), Experience, Education, Certifications, Testing, Contact render in both Locales; only QA-relevant entries are visible; works without JavaScript; no horizontal scroll at 320 px |
| R5 | Modals | More (experience, education) and Dev Projects open from their buttons, close with Escape, the Close button and the backdrop, return focus to the opener, keep keyboard focus off the page behind, fit a phone screen |
| R6 | Accessibility | No axe violations (WCAG 2.1 A/AA + best practices) in 4 Theme × Locale combinations, plus each modal; one h1, no skipped heading levels; skip link; visible focus; reduced motion honoured |
| R7 | Visual consistency | Screenshots match their baselines for Theme × Locale × (desktop, mobile) and for each modal in both Themes |
| R8 | Privacy | No birthday or phone number in the page, the bundle or the content exposed to the web build; the phone number appears only in the PDFs |
| R9 | CV PDFs | The button links to the PDF for the active Locale and downloads it; each PDF is at most two pages, contains the same visible entries as the site, and includes the phone number |
| R10 | Transparency | The testing section lists the real layers and links to the report, test plan, source, bugs and CI runs; the CI badge has an accessible name |
| R11 | Performance and SEO | Lighthouse scores of at least 0.9 (performance), 0.98 (accessibility), 0.95 (best practices, SEO) in both Locales |
| R12 | Links | Every internal link resolves; every external link answers; new-tab links use `rel="noopener"` |
| R13 | Delivery | Deploy depends on the functional and visual jobs; the Playwright image tag matches the installed Playwright version |

## Approach

- **Per commit and pull request** (`ci.yml`): lint, type-check, unit tests (as part of the build), build, PDF
  generation, functional tests on Chromium, Firefox and WebKit, and visual tests in the Playwright container.
  Deployment waits for both.
- **Nightly** (`nightly.yml`): Lighthouse CI and the link crawler against the freshly built site.
- **On demand:** regenerate screenshot baselines inside the container (`update-visual-baselines.yml`, or
  `npm run test:visual:update` with Docker) when a visual change is intentional, then review the image diff in
  the pull request like any other change.
- **Manual exploratory sessions** before a release: keyboard-only pass, a screen reader pass (NVDA + Firefox),
  small-phone and print checks. Findings become bug issues.

## Test data

All data comes from the Content Source. Negative tests clone it and break one rule at a time. No credentials,
accounts or backend are involved.

## Environments and browsers

| Where | Browsers | Notes |
| --- | --- | --- |
| Local | Chromium (Playwright) | Fast feedback; visual tests only via Docker |
| CI functional | Chromium, Firefox, WebKit | Playwright's bundled builds |
| CI visual | Chromium in the Playwright image | Single baseline per screenshot, no platform suffix |
| Production | Any evergreen browser | GitHub Pages |

## Schedule and responsibilities

Single maintainer. Per-commit checks run in about three minutes; the nightly workflow runs at 05:17 UTC.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Screenshot flakiness | Fixed container, animations disabled, images decoded before capture, live badge replaced |
| External sites changing | External links are checked nightly, not per commit |
| Playwright image drifting from the library | A unit test compares the workflow image tag with the installed version |
| Test documentation drifting | `test-cases.md` is generated from the tests and verified by a unit test |
| A browser difference hides a defect | Functional tests run on three engines |

## Out of scope

Cypress and Selenium suites (later projects), load testing (static hosting), security testing beyond the privacy
checks, and real-device farms.

## Deliverables

[Strategy](strategy.md), this plan, [test cases](test-cases.md), the Playwright report published at `/reports/`
on the deployed site, Lighthouse reports from the nightly run, and bug issues in
[GitHub Issues](https://github.com/ygg-m/cv/issues?q=label%3Abug).
