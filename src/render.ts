import { cv } from "./content";
import type { Locale } from "./i18n";

type Text = Record<Locale, string>;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const t = (text: Text, locale: Locale): string => escapeHtml(text[locale]);
const ui = (key: Exclude<keyof typeof cv.ui, "sections">, locale: Locale): string => t(cv.ui[key], locale);
const section = (key: keyof typeof cv.ui.sections, locale: Locale): string => t(cv.ui.sections[key], locale);

function formatPoint(value: string, locale: Locale): string {
  if (/^\d{4}$/.test(value)) return value;
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}-01T00:00:00Z`),
  );
}

/** "Dec 2025 - Present", "2010 - Present", "Jan 2025 - Jul 2025". Rendered with an en dash. */
export function formatPeriod(start: string, end: string | null, locale: Locale): string {
  const to = end === null ? cv.ui.present[locale] : formatPoint(end, locale);
  return `${formatPoint(start, locale)} – ${to}`;
}

export const pdfFileName = (locale: Locale): string => `Ygor-Goulart-CV-${locale}.pdf`;

const image = (path: string): string => `<img src="assets/${path}" alt="" width="64" height="64" loading="lazy">`;

function renderHero(locale: Locale): string {
  const { profile } = cv;
  return `
    <section class="hero" aria-labelledby="hero-title">
      <h1 id="hero-title">${escapeHtml(profile.name)}</h1>
      <p id="headline">${t(profile.headline.title, locale)}</p>
      <p id="subtitle">${t(profile.headline.subtitle, locale)}</p>
      <p class="muted" id="location">${escapeHtml(profile.location.city)}, ${t(profile.location.country, locale)}</p>
      <p class="actions">
        <a class="button button-primary" href="#contact">${ui("contactCta", locale)}</a>
        <a class="button button-secondary" href="cv/${pdfFileName(locale)}" download>${ui("downloadCv", locale)}</a>
        <button class="button button-secondary" type="button" data-open-dialog="dialog-dev-projects">${ui("devProjects", locale)}</button>
      </p>
    </section>`;
}

function renderAbout(locale: Locale): string {
  return `
    <section id="about" aria-labelledby="about-title">
      <h2 id="about-title">${section("about", locale)}</h2>
      <p>${t(cv.profile.about, locale)}</p>
    </section>`;
}

function renderSkills(locale: Locale): string {
  const group = (g: (typeof cv.skills)[number]) => `
        <li class="card">
          <h4>${t(g.name, locale)}</h4>
          <ul class="chips">${g.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </li>`;
  const core = cv.skills.filter((g) => g.core);
  const supporting = cv.skills.filter((g) => !g.core);
  return `
    <section id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title">${section("skills", locale)}</h2>
      <h3>${ui("coreSkills", locale)}</h3>
      <ul class="grid" data-skills="core">${core.map(group).join("")}</ul>
      <h3>${ui("supportingSkills", locale)}</h3>
      <ul class="grid" data-skills="supporting">${supporting.map(group).join("")}</ul>
      <h3>${ui("spokenLanguages", locale)}</h3>
      <ul class="chips" data-skills="spoken">${cv.spokenLanguages
        .map((l) => `<li>${t(l.name, locale)}: ${t(l.level, locale)}</li>`)
        .join("")}</ul>
    </section>`;
}

type Job = (typeof cv.experience)[number];
type Study = (typeof cv.education)[number];

function jobCard(job: Job, locale: Locale): string {
  return `
        <li class="card entry" data-id="${job.id}">
          ${image(job.image)}
          <div>
            <h3>${t(job.role, locale)}</h3>
            <p class="muted">${escapeHtml(job.company)} &middot; ${formatPeriod(job.start, job.end, locale)}</p>
            <ul>${job.highlights.map((h) => `<li>${t(h, locale)}</li>`).join("")}</ul>
          </div>
        </li>`;
}

function studyCard(item: Study, locale: Locale): string {
  const institution = typeof item.institution === "string" ? escapeHtml(item.institution) : t(item.institution, locale);
  const status = item.status === "in-progress" ? ` &middot; ${ui("inProgress", locale)}` : "";
  const topics = item.topics
    ? `<ul class="chips">${item.topics.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
    : "";
  return `
        <li class="card entry" data-id="${item.id}">
          ${image(item.image)}
          <div>
            <h3>${t(item.title, locale)}</h3>
            <p class="muted">${institution}${status}</p>
            ${topics}
          </div>
        </li>`;
}

function moreButton(dialogId: string, labelKey: "moreExperience" | "moreEducation", locale: Locale): string {
  return `<p><button class="button button-secondary" type="button" data-open-dialog="${dialogId}" aria-label="${ui(labelKey, locale)}">${ui("more", locale)}</button></p>`;
}

function renderExperience(locale: Locale): string {
  const jobs = cv.experience.filter((e) => e.visibility === "visible");
  return `
    <section id="experience" aria-labelledby="experience-title">
      <h2 id="experience-title">${section("experience", locale)}</h2>
      <ul class="stack" data-list="experience">${jobs.map((job) => jobCard(job, locale)).join("")}</ul>
      ${moreButton("dialog-more-experience", "moreExperience", locale)}
    </section>`;
}

function renderEducation(locale: Locale): string {
  const items = cv.education.filter((e) => e.visibility === "visible");
  return `
    <section id="education" aria-labelledby="education-title">
      <h2 id="education-title">${section("education", locale)}</h2>
      <ul class="stack" data-list="education">${items.map((item) => studyCard(item, locale)).join("")}</ul>
      ${moreButton("dialog-more-education", "moreEducation", locale)}
    </section>`;
}

function renderCertifications(locale: Locale): string {
  return `
    <section id="certifications" aria-labelledby="certifications-title">
      <h2 id="certifications-title">${section("certifications", locale)}</h2>
      <ul class="stack" data-list="certifications">${cv.certifications
        .map((c) => {
          const hours = "hours" in c ? ` &middot; ${c.hours} ${ui("hours", locale)}` : "";
          return `
        <li class="card" data-id="${c.id}">
          <h3>${t(c.name, locale)}</h3>
          <p class="muted">${escapeHtml(c.issuer)} &middot; ${c.year} &middot; ${t(c.format, locale)}${hours}</p>
        </li>`;
        })
        .join("")}</ul>
    </section>`;
}

export const REPO_URL = "https://github.com/ygg-m/cv";

function renderTesting(locale: Locale): string {
  const { testing } = cv;
  const link = (key: keyof typeof testing.links, href: string) =>
    `<li><a href="${href}" rel="noopener">${t(testing.links[key], locale)}</a></li>`;
  return `
    <section id="testing" aria-labelledby="testing-title">
      <h2 id="testing-title">${t(testing.title, locale)}</h2>
      <p>${t(testing.intro, locale)}</p>
      <p><a href="${REPO_URL}/actions/workflows/ci.yml" rel="noopener"><img src="${REPO_URL}/actions/workflows/ci.yml/badge.svg?branch=main" alt="${t(testing.badgeAlt, locale)}" width="78" height="20"></a></p>
      <ul class="grid" data-list="test-layers">${testing.layers
        .map(
          (layer) => `
        <li class="card" data-id="${layer.id}">
          <h3>${t(layer.name, locale)}</h3>
          <p class="muted">${escapeHtml(layer.tool)}</p>
          <p>${t(layer.description, locale)}</p>
        </li>`,
        )
        .join("")}</ul>
      <ul class="chips links-list" data-list="testing-links">
        ${link("report", "reports/")}
        ${link("plan", `${REPO_URL}/blob/main/docs/qa/test-plan.md`)}
        ${link("source", REPO_URL)}
        ${link("bugs", `${REPO_URL}/issues?q=label%3Abug`)}
        ${link("runs", `${REPO_URL}/actions`)}
      </ul>
    </section>`;
}

function renderContact(locale: Locale): string {
  const { contact, profile } = cv;
  return `
    <section id="contact" aria-labelledby="contact-title">
      <h2 id="contact-title">${section("contact", locale)}</h2>
      <ul class="stack" data-list="contact">
        <li><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
        <li><a href="${escapeHtml(contact.linkedin)}" rel="me noopener">LinkedIn</a></li>
        <li><a href="${escapeHtml(contact.github)}" rel="me noopener">GitHub</a></li>
        <li class="muted">${escapeHtml(profile.location.city)}, ${t(profile.location.country, locale)}</li>
      </ul>
    </section>`;
}

function dialog(id: string, title: string, body: string, locale: Locale): string {
  return `
    <dialog id="${id}" aria-labelledby="${id}-title">
      <div class="dialog-header">
        <h2 id="${id}-title">${title}</h2>
        <button class="toggle" type="button" data-close-dialog>${ui("close", locale)}</button>
      </div>
      ${body}
    </dialog>`;
}

function projectCard(project: (typeof cv.devProjects)[number], locale: Locale): string {
  const name = t(project.name, locale);
  const live =
    "live" in project
      ? `<a href="${escapeHtml(project.live)}" target="_blank" rel="noopener" aria-label="${ui("liveDemo", locale)}: ${name}">${ui("liveDemo", locale)}</a>`
      : "";
  return `
        <li class="card entry" data-id="${project.id}">
          ${image(project.image)}
          <div>
            <h3>${name}</h3>
            <p>${t(project.description, locale)}</p>
            <ul class="chips">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
            <p class="links"><a href="${escapeHtml(project.github)}" target="_blank" rel="noopener" aria-label="${ui("github", locale)}: ${name}">${ui("github", locale)}</a> ${live}</p>
          </div>
        </li>`;
}

function renderDialogs(locale: Locale): string {
  const moreJobs = cv.experience.filter((e) => e.visibility === "more");
  const moreStudies = cv.education.filter((e) => e.visibility === "more");
  return (
    dialog(
      "dialog-more-experience",
      ui("moreExperience", locale),
      `<ul class="stack" data-list="more-experience">${moreJobs.map((j) => jobCard(j, locale)).join("")}</ul>`,
      locale,
    ) +
    dialog(
      "dialog-more-education",
      ui("moreEducation", locale),
      `<ul class="stack" data-list="more-education">${moreStudies.map((e) => studyCard(e, locale)).join("")}</ul>`,
      locale,
    ) +
    dialog(
      "dialog-dev-projects",
      ui("devProjects", locale),
      `<ul class="stack" data-list="dev-projects">${cv.devProjects.map((p) => projectCard(p, locale)).join("")}</ul>`,
      locale,
    )
  );
}

/** Everything inside #content for one Locale. Pure string output so the build can pre-render it. */
export function renderContent(locale: Locale): string {
  return `
    <main id="main" tabindex="-1">${renderHero(locale)}${renderAbout(locale)}${renderSkills(locale)}${renderExperience(locale)}${renderEducation(locale)}${renderCertifications(locale)}${renderTesting(locale)}${renderContact(locale)}
    </main>
    <footer><p class="muted">${ui("footer", locale)}</p></footer>${renderDialogs(locale)}`;
}
