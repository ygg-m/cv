# Ygor Goulart — QA & Automation Engineer

[![CI](https://github.com/ygg-m/cv/actions/workflows/ci.yml/badge.svg)](https://github.com/ygg-m/cv/actions/workflows/ci.yml)
[![External links](https://github.com/ygg-m/cv/actions/workflows/external-links.yml/badge.svg)](https://github.com/ygg-m/cv/actions/workflows/external-links.yml)

My online CV, served at **https://ygg-m.github.io/cv/** — a static, bilingual (English default / Português-BR) single-page site built with **plain HTML, CSS and JavaScript**. No frameworks, no build step.

The site doubles as the first entry of my QA portfolio: its own test suite runs in GitHub Actions on every push and pull request.

## Features

- **Bilingual (EN / PT-BR)** — `data-i18n` attributes + JSON dictionaries. Language precedence: `?lang=` URL parameter → stored preference (`localStorage`) → English default. Switcher lives in the navbar; the URL stays shareable in the current language.
- **Dark & light themes** — follows the OS color scheme on the first visit; the manual toggle persists.
- **QA-first content** — QA & Automation projects lead; pre-pivot career, the design degree and development projects sit behind "More" buttons.
- **Self-testing pipeline** — HTML validation, guarded internal link check, Playwright smoke tests and axe accessibility scans (EN/PT × dark/light).

## Structure

```
index.html            # full semantic markup, English copy inline with data-i18n keys
css/styles.css        # hand-written CSS, theme tokens for dark/light
js/i18n.js            # language resolution, dictionary application, URL sync
js/main.js            # theme, nav, "More" toggles, language switch
locales/en.json       # English dictionary (kept in sync with index.html by a test)
locales/pt.json       # Portuguese-BR dictionary
assets/               # photos, company logos, project thumbnails, icons
tests/                # Playwright: smoke, i18n sync, accessibility (axe)
scripts/check-links.mjs  # link check with a vacuous-pass guard
.github/workflows/    # CI (validate + test + deploy), weekly external link check
GLOSSARY.md           # shared language for this project
docs/adr/             # architecture decision records
```

## Development

```bash
npm install
npm run serve          # http://127.0.0.1:4173
```

## Quality checks

```bash
npm run validate       # html-validate on index.html
npm run links          # internal links & assets — fails if fewer than 20 links are scanned
npm run links:external # outbound links on the live site (weekly CI job)
npm test               # Playwright: smoke + i18n dictionary sync + axe
npm run ci             # validate + links + tests (what every PR runs)
```

The internal link check deliberately fails on suspiciously low link counts: linkinator can exit 0 while scanning *zero* links if a skip rule matches everything (local files are crawled through a temporary `http://127.0.0.1` server), and a validator that validates nothing is worse than no validator.

## Changing the copy

English lives in **`index.html`** and **`locales/en.json`** (identical strings); Portuguese lives in **`locales/pt.json`**.

- Translatable text: element carries `data-i18n="key"` (leaf elements only).
- Translatable accessible names: `aria-label="…" data-i18n-aria="key"` (label first).
- `tests/i18n.spec.js` fails if HTML and `en.json` drift, if `pt.json` misses a key, or if switching languages leaves any element untranslated.

## Deployment

Push to `main` → the **CI** workflow validates, tests, then deploys the site to GitHub Pages via Actions.

> Repository setting required once: **Settings → Pages → Source: GitHub Actions**.

Outbound links are checked weekly by the **External links** workflow (it never blocks PRs, because external sites are flaky).

## Docs

- [GLOSSARY.md](./GLOSSARY.md) — the shared language (QA-first positioning, pivot-era content, language precedence, seed QA project).
- [docs/adr/0001](./docs/adr/0001-rebuild-as-static-bilingual-site.md) — why the site dropped React for plain HTML/CSS/JS.
