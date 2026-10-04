# CV: Ygor Goulart, QA Tester

A bilingual (English / pt-BR) CV that doubles as the system under test of a QA portfolio: the site presents the
CV, and its automated Test Suite shows how it is verified.

- Plan and decisions: [docs/plan.md](docs/plan.md), [GLOSSARY.md](GLOSSARY.md), [docs/adr/](docs/adr/)
- QA documentation: [strategy](docs/qa/strategy.md), [test plan](docs/qa/test-plan.md),
  [test cases](docs/qa/test-cases.md)
- Bugs: [GitHub Issues labelled `bug`](https://github.com/ygg-m/cv/issues?q=label%3Abug)

## Stack

Vite + vanilla TypeScript, built to a single `index.html` with CSS and JS inlined (images in `assets/`).
All content lives in [`src/content/cv.json`](src/content/cv.json) with every text in both Locales, validated by
[`cv.schema.json`](src/content/cv.schema.json). The default Locale is pre-rendered into the HTML at build time.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Unit tests, type-check, then build to `dist/` |
| `npm run build:all` | `build`, then generate the CV PDFs into `dist/cv/` (needs Chromium) |
| `npm run lint` | ESLint |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright on Chromium, Firefox and WebKit (builds and previews first) |
| `npm run test:visual:docker` | Visual regression inside the Playwright Docker image (needs Docker) |
| `npm run test:visual:update` | Same, regenerating the screenshot baselines |
| `npm run lighthouse` | Lighthouse CI budgets against `dist/` |
| `npm run check:links` | Crawl every link on the site (needs network) |
| `npm run docs:test-cases` | Regenerate `docs/qa/test-cases.md` from the test titles |

First time: `npm ci` and `npx playwright install`.

## Updating visual baselines without Docker

Screenshots are compared only inside the Playwright container ([ADR 0003](docs/adr/0003-visual-tests-run-in-docker.md)).
When a visual change is intentional and Docker is not installed, regenerate the baselines in CI:

```bash
date -u > .github/visual-baselines.trigger
git add -A && git commit -m "Update baselines" && git push
```

The **Update visual baselines** workflow commits the new images to the same branch (pull before your next push).
Review the image diff like any other change.

## Pipeline

[`ci.yml`](.github/workflows/ci.yml) runs lint, build, PDF generation and the functional suite on three
browsers, plus the visual suite in the container; the deploy job needs both ([ADR 0002](docs/adr/0002-tests-gate-deployment.md)).
[`nightly.yml`](.github/workflows/nightly.yml) runs Lighthouse CI and the link crawler.
