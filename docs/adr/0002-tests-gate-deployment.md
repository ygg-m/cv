# Tests gate deployment; Playwright is the primary tool

The CV Site is the system under test of the QA portfolio, so GitHub Pages deploys from `main` only when the full Test Suite passes (lint, types, unit, E2E, accessibility, visual). Playwright is the single primary E2E tool; more tools (Cypress, Selenium) are added later only as deliberate comparisons. The Playwright HTML report is published publicly alongside the site as portfolio evidence.

## Consequences

- A flaky test blocks publishing the CV, so consistency matters more than test count.
