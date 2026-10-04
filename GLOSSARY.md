# QA Portfolio CV

A bilingual digital CV for a QA Tester that is itself the system under test for the owner's QA portfolio: the site presents the CV, and its automated test suite demonstrates the owner's testing skills.

## Language

**CV Site**:
The public website presenting the owner's CV. Also the product that the portfolio's tests validate.
_Avoid_: Portfolio site, resume page

**Test Suite**:
The set of automated checks that validate the CV Site across behaviour, accessibility, visuals, browsers, performance, and links. Shown publicly as part of the portfolio.
_Avoid_: Test project, QA project

**Content Source**:
The single structured record of all CV facts (experience, education, skills, projects) with every text available in both Locales. The CV Site and the downloadable CV PDFs are derived from it.
_Avoid_: Data files, CMS

**Locale**:
One of the two languages the CV Site is presented in: English (default) or Brazilian Portuguese.
_Avoid_: Language version, translation

**Theme**:
The visual mode of the CV Site: light or dark. Follows the visitor's OS preference, falling back to dark; an explicit visitor choice overrides both.
_Avoid_: Skin, mode

**Primary Color**:
Purple, the brand color used for main emphasis. Replaces amber, which becomes the Accent Color.

**Accent Color**:
Amber, the secondary highlight color. Light Theme variants are adjusted to keep readable contrast.

**Visible Experience**:
Work history entries relevant to QA, shown directly on the page.
_Avoid_: Main experience, relevant jobs

**Visible Education**:
Education entries relevant to QA, shown directly on the page. Each entry has a status: completed or in progress (the owner's degree is in progress).

**Certification**:
A formal credential in testing or platform certification, shown in its own section.
_Avoid_: Course, badge

**Core Skills**:
The QA-relevant skill group shown first (test automation, API testing, QA process); supporting groups follow.
_Avoid_: Top skills, main skills

**More**:
A button that opens a modal listing the Content Source entries that are not QA-relevant (older or unrelated experience and education).
_Avoid_: Other, archive, hidden section

**Dev Projects**:
The owner's personal software projects (the former projects section), kept out of the main flow and opened in a modal by a dedicated button.
_Avoid_: Side projects, portfolio projects
