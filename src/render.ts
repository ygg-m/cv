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

const image = (path: string): string => `<img src="assets/${path}" alt="" width="64" height="64" loading="lazy">`;

function renderHero(locale: Locale): string {
  const { profile } = cv;
  return `
    <section class="hero" aria-labelledby="hero-title">
      <h1 id="hero-title">${escapeHtml(profile.name)}</h1>
      <p id="headline">${t(profile.headline.title, locale)}</p>
      <p id="subtitle">${t(profile.headline.subtitle, locale)}</p>
      <p class="muted" id="location">${escapeHtml(profile.location.city)}, ${t(profile.location.country, locale)}</p>
      <p><a class="button button-primary" href="#contact">${ui("contactCta", locale)}</a></p>
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

function renderExperience(locale: Locale): string {
  const jobs = cv.experience.filter((e) => e.visibility === "visible");
  return `
    <section id="experience" aria-labelledby="experience-title">
      <h2 id="experience-title">${section("experience", locale)}</h2>
      <ul class="stack" data-list="experience">${jobs
        .map(
          (job) => `
        <li class="card entry" data-id="${job.id}">
          ${image(job.image)}
          <div>
            <h3>${t(job.role, locale)}</h3>
            <p class="muted">${escapeHtml(job.company)} &middot; ${formatPeriod(job.start, job.end, locale)}</p>
            <ul>${job.highlights.map((h) => `<li>${t(h, locale)}</li>`).join("")}</ul>
          </div>
        </li>`,
        )
        .join("")}</ul>
    </section>`;
}

function renderEducation(locale: Locale): string {
  const items = cv.education.filter((e) => e.visibility === "visible");
  return `
    <section id="education" aria-labelledby="education-title">
      <h2 id="education-title">${section("education", locale)}</h2>
      <ul class="stack" data-list="education">${items
        .map((item) => {
          const institution = typeof item.institution === "string" ? escapeHtml(item.institution) : t(item.institution, locale);
          const status = item.status === "in-progress" ? ` &middot; ${ui("inProgress", locale)}` : "";
          return `
        <li class="card entry" data-id="${item.id}">
          ${image(item.image)}
          <div>
            <h3>${t(item.title, locale)}</h3>
            <p class="muted">${institution}${status}</p>
          </div>
        </li>`;
        })
        .join("")}</ul>
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

/** Everything inside #content for one Locale. Pure string output so the build can pre-render it. */
export function renderContent(locale: Locale): string {
  return `
    <main id="main" tabindex="-1">${renderHero(locale)}${renderAbout(locale)}${renderSkills(locale)}${renderExperience(locale)}${renderEducation(locale)}${renderCertifications(locale)}${renderContact(locale)}
    </main>
    <footer><p class="muted">${ui("footer", locale)}</p></footer>`;
}
