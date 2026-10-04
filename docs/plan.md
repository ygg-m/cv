# Rebuild plan: QA Portfolio CV

Rebuild the CV Site as a bilingual, QA-focused static site that is also the system under test of the owner's QA portfolio. Vocabulary: [GLOSSARY.md](../GLOSSARY.md). Decisions: [docs/adr/](adr/).

Work happens on the `rebuild` branch and merges to `main` when slice 11 is done. Package manager: `npm`.

## Decisions at a glance

| Area | Decision |
| --- | --- |
| Positioning | Title "QA Tester" with subtitle "Test Automation" (en) / "Automação de Testes" (pt-BR) |
| Build | Vite + vanilla TypeScript, one `index.html` with inlined CSS/JS, images in `assets/` (ADR 0001) |
| Locale | English default; `?lang=pt-BR` for Portuguese; toggle in the UI; persisted |
| Theme | OS preference, fallback dark; explicit choice persisted; `data-theme` set by an inline script |
| Colors | Primary purple (start `#8b5cf6` dark / `#6d28d9` light), accent amber; WCAG AA in both Themes |
| Content Source | One JSON file, `{en, pt-BR}` per text field, validated by JSON Schema; missing translation fails the build |
| Privacy | No birthday, no phone on the web page; phone appears only in the generated PDFs |
| Contact | Email, LinkedIn, GitHub, city/country; no form |
| Test tooling | Playwright primary, axe, Vitest, Lighthouse CI, link checker (ADR 0002) |
| Visual tests | Official Playwright Docker image, locally and in CI (ADR 0003) |
| Deploy | GitHub Pages, only when the full Test Suite passes; Playwright report published under `/reports/` |

## Page structure

Hero (name, headline, buttons: Contact, Download CV, Dev Projects) → About → Skills → Visible Experience (+ **More**) → Visible Education (+ **More**) → Certifications → How this site is tested → Contact → Footer.

- **Visible Experience:** SIDE (Senior QA Tester), ACS Pro (IT Support), Concentrix.
- **More** (modal): BI Agent (ACSoftware), IdeaMaker, LIQ, PAK, freelance; design background (10 years graphic design, UX/UI).
- **Visible Education:** Computer Science degree (Anhembi Morumbi), status: in progress (no end date).
- **Certifications:** QA Certification (Iterasys, 2024); Console, Platform and Store Title Certification (SIDE, 2026, 112 h).
- **Skills** (no proficiency bars; Core Skills first): Test Automation (Playwright, Cypress, Selenium), API Testing (Postman), QA Process (Jira, TestRail, Confluence, Agile/Scrum), Languages (JavaScript, TypeScript, Python, SQL), Frameworks (Node.js, React, Angular, WordPress), DevOps & Tools (Git/GitHub, Docker, databases: MySQL, PostgreSQL, SQL Server, MongoDB; OS: Windows, Linux), IT Ops (ITIL, ManageEngine, Zoho Suite, Active Directory, Office 365, Incident Management, DevOps), Design (Figma, Adobe). Spoken languages (Portuguese native, English fluent) as a small separate block.
- **Modals** (More, Dev Projects): native `<dialog>`; Escape closes; focus returns to the opener.

## Slices

Each slice ships with its tests; each test title carries a test-case ID from `docs/qa/`.

1. **Walking skeleton**: Vite scaffold, blank page, one Playwright test, CI workflow, Pages deploy path.
2. **Content Source and Locale**: JSON + schema, translation completeness check, Locale switching via query string and toggle.
3. **Theme**: purple/amber tokens, light/dark, OS-first with dark fallback, persistence, no flash on load.
4. **Page sections**: Hero, About, Skills, Visible Experience, Visible Education, Certifications, Contact, Footer.
5. **Modals**: More (experience, education) and Dev Projects.
6. **Accessibility suite**: axe across Theme × Locale, plus a unit test over color-token contrast.
7. **Visual regression**: Docker image; matrix Theme × Locale × (desktop, mobile) plus each modal.
8. **CV PDFs**: generate en and pt-BR via Playwright `page.pdf()` with a print layout including the phone.
9. **"How this site is tested" section**: test layers, CI badge, links to report and test plan; publish Playwright report.
10. **Nightly job**: Lighthouse CI and link checker.
11. **QA docs**: `docs/qa/` test strategy, test plan, test cases with IDs; bug report issue template; found bugs filed as GitHub Issues.

## Open items

- Purple/amber shades are Claude's call; finalize while tuning contrast in slice 3 (starting points in the table above).

## Out of scope

- Cypress and Selenium suites: reserved for later projects, once the core suite is stable.
