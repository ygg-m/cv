// Print layout for the downloadable CV PDFs. Unlike the web page, it includes the phone number,
// which lives in the Content Source's `pdfOnly` section. Never import this module from the site bundle.
import cv from "./content/cv.json";
import type { Locale } from "./i18n";
import { formatPeriod } from "./render";

export { pdfFileName } from "./render";

type Text = Record<Locale, string>;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const t = (text: Text, locale: Locale): string => escapeHtml(text[locale]);
const display = (url: string): string => escapeHtml(url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""));

const STYLE = `
  @page { size: A4; margin: 14mm 15mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 10pt/1.4 Arial, Helvetica, sans-serif; color: #1b1530; }
  h1 { margin: 0; font-size: 22pt; }
  .headline { margin: 2pt 0 0; font-size: 12pt; font-weight: 700; color: #6d28d9; }
  .contact { margin: 4pt 0 0; color: #554e75; }
  h2 { margin: 12pt 0 4pt; padding-bottom: 2pt; border-bottom: 2pt solid #ffb703; font-size: 11pt; text-transform: uppercase; letter-spacing: 0.04em; }
  .row { display: flex; justify-content: space-between; gap: 12pt; break-inside: avoid; }
  .row h3 { margin: 6pt 0 0; font-size: 10.5pt; }
  .row .period { white-space: nowrap; color: #554e75; }
  .muted { margin: 0; color: #554e75; }
  ul { margin: 2pt 0 0; padding-left: 14pt; }
  li { margin: 1pt 0; }
  .skills p { margin: 2pt 0; }
`;

export function renderCvDocument(locale: Locale): string {
  const { profile, contact, pdfOnly, ui } = cv;
  const heading = (key: keyof typeof ui.sections) => `<h2>${t(ui.sections[key], locale)}</h2>`;

  const jobs = cv.experience
    .filter((e) => e.visibility === "visible")
    .map(
      (job) => `
    <div class="row"><h3>${t(job.role, locale)}</h3><span class="period">${formatPeriod(job.start, job.end, locale)}</span></div>
    <p class="muted">${escapeHtml(job.company)}</p>
    <ul>${job.highlights.map((h) => `<li>${t(h, locale)}</li>`).join("")}</ul>`,
    )
    .join("");

  const education = cv.education
    .filter((e) => e.visibility === "visible")
    .map((e) => {
      const institution = typeof e.institution === "string" ? escapeHtml(e.institution) : t(e.institution, locale);
      const status = e.status === "in-progress" ? ` &middot; ${t(ui.inProgress, locale)}` : "";
      return `<div class="row"><h3>${t(e.title, locale)}</h3></div><p class="muted">${institution}${status}</p>`;
    })
    .join("");

  const certifications = cv.certifications
    .map((c) => {
      const hours = "hours" in c ? ` &middot; ${c.hours} ${t(ui.hours, locale)}` : "";
      return `<div class="row"><h3>${t(c.name, locale)}</h3><span class="period">${c.year}</span></div><p class="muted">${escapeHtml(c.issuer)} &middot; ${t(c.format, locale)}${hours}</p>`;
    })
    .join("");

  const skills = cv.skills
    .map((g) => `<p><strong>${t(g.name, locale)}:</strong> ${g.items.map(escapeHtml).join(", ")}</p>`)
    .join("");

  const spoken = cv.spokenLanguages.map((l) => `${t(l.name, locale)}: ${t(l.level, locale)}`).join(" &middot; ");

  return `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(profile.name)} - CV</title>
  <style>${STYLE}</style>
</head>
<body>
  <h1>${escapeHtml(profile.name)}</h1>
  <p class="headline">${t(profile.headline.title, locale)} &middot; ${t(profile.headline.subtitle, locale)}</p>
  <p class="contact">${escapeHtml(contact.email)} &middot; ${escapeHtml(pdfOnly.phone)} &middot; ${display(contact.linkedin)} &middot; ${display(contact.github)} &middot; ${escapeHtml(profile.location.city)}, ${t(profile.location.country, locale)}</p>
  ${heading("about")}<p>${t(profile.about, locale)}</p>
  ${heading("experience")}${jobs}
  ${heading("education")}${education}
  ${heading("certifications")}${certifications}
  ${heading("skills")}<div class="skills">${skills}</div>
  <h2>${t(ui.spokenLanguages, locale)}</h2><p>${spoken}</p>
</body>
</html>`;
}
