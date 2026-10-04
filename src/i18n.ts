import { cv } from "./content";

export const LOCALES = ["en", "pt-BR"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const STORAGE_KEY = "locale";

/** Normalizes user-supplied values such as "pt-br", "pt" or "en-US"; null when unsupported. */
export function parseLocale(value: string | null | undefined): Locale | null {
  const lang = value?.trim().toLowerCase().split(/[-_]/)[0];
  if (lang === "en") return "en";
  if (lang === "pt") return "pt-BR";
  return null;
}

/** Query string beats the stored choice, which beats the default (ADR 0001). */
export function resolveLocale(search: string, stored: string | null): Locale {
  const fromQuery = parseLocale(new URLSearchParams(search).get("lang"));
  return fromQuery ?? parseLocale(stored) ?? DEFAULT_LOCALE;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "pt-BR" : "en";
}

/** Looks up a `{en, pt-BR}` text object by dotted path in the Content Source. */
export function getText(path: string, locale: Locale): string {
  const node = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], cv);
  const text = (node as Partial<Record<Locale, string>> | undefined)?.[locale];
  if (typeof text !== "string") throw new Error(`Missing text "${path}" for locale ${locale}`);
  return text;
}

export function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked (private windows); the choice then lasts for the page only.
  }
}

export function applyLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = getText(el.dataset.i18n!, locale);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-label]").forEach((el) => {
    el.setAttribute("aria-label", getText(el.dataset.i18nLabel!, locale));
  });
  document.title = `${cv.profile.name} - ${getText("profile.headline.title", locale)}`;

  const target = otherLocale(locale);
  const toggle = document.getElementById("locale-toggle");
  if (toggle) {
    toggle.setAttribute("aria-label", getText("ui.localeToggleLabel", locale));
    const label = toggle.querySelector<HTMLElement>("span");
    if (label) {
      label.textContent = getText("ui.localeToggle", locale);
      label.lang = target;
    }
  }
}
