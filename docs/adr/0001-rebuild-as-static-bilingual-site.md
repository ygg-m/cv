# Rebuild the CV as a static bilingual site

Status: accepted

The site was a Create React App (TypeScript + Tailwind/DaisyUI) holding English-only content, deployed by pushing `build/` to a `gh-pages` branch through the `gh-pages` npm package. We replaced it with plain HTML/CSS/JavaScript plus a client-side i18n dictionary: a one-page CV gains nothing from a React toolchain, and dropping the build step removes dependency rot, keeps the page readable as plain files, and lets the QA tooling (html-validate, linkinator, Playwright, axe) operate directly on what ships. For language switching we chose in-place dictionary swaps — `locales/en.json` and `locales/pt.json` applied to `data-i18n` attributes — over duplicated `/en/` and `/pt/` page trees: the content is small, duplication of every copy edit would guarantee drift, and English (the default) lives directly in the HTML with `tests/i18n.spec.js` enforcing parity with `en.json`. Deployment moved to a GitHub Actions workflow that publishes to Pages, which removed the manual `npm run deploy` step and turned deployment itself into a pipeline artifact.

**Considered options**: keep React and add react-i18next; duplicate the page under `/en/` and `/pt/` routes; keep the `gh-pages` branch flow.

**Consequences**: copy edits must be made in both `index.html` and `locales/en.json` (the sync test enforces this); `?lang=pt` links are shareable but there are no stable per-language URLs for SEO; the old React source lives only in git history.
