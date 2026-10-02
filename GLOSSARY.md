# CV Portfolio

The public CV site of Ygor Goulart at ygg-m.github.io/cv: a static, bilingual single page whose purpose is to present him as a QA & Automation Engineer. The repository doubles as his first QA portfolio piece — the site tests itself.

## Language

**QA-first positioning**:
Presenting Ygor primarily as a QA & Automation Engineer; development and design appear only as supporting context.
_Avoid_: Developer & Designer, Web Developer (as headline)

**Pivot-era content**:
Career and education content from before the move into QA — the Idea Maker and LIQ roles, the Design degree, and the development projects — kept on the page but hidden behind "More" buttons so the QA timeline leads.
_Avoid_: legacy content, old jobs

**Language precedence**:
The rule that decides which language renders: `?lang=` URL parameter → stored preference (`localStorage`) → English default. A language reached through a shared URL does not overwrite the visitor's stored preference.
_Avoid_: default language, locale priority

**Seed QA project**:
This repository's own CI test suite, listed as the first QA & Automation project entry until more automation projects are added to it.
_Avoid_: demo project, sample test
