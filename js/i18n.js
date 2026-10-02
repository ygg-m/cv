/**
 * i18n — single-page language switching backed by JSON dictionaries.
 *
 * Precedence: URL (?lang=) > stored preference (localStorage) > English default.
 * The URL is kept in sync on every change so the address bar is always
 * shareable in the language being read (English is the default, so it is
 * represented by the absence of the parameter).
 */

export const SUPPORTED_LANGS = ["en", "pt"];
const LANG_STORAGE_KEY = "lang";

let dict = Object.create(null);
let currentLang = "en";

function isSupported(value) {
  return SUPPORTED_LANGS.includes(value);
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
}

function applyText() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

function applyAria() {
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
}

function syncUrl(lang) {
  const url = new URL(window.location.href);
  if (lang === "en") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", lang);
  }
  window.history.replaceState(null, "", url);
}

export async function applyLang(lang, { persist = false } = {}) {
  if (!isSupported(lang)) {
    lang = "en";
  }
  const response = await fetch(`locales/${lang}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load locales/${lang}.json (HTTP ${response.status})`);
  }
  dict = await response.json();
  currentLang = lang;

  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  applyText();
  applyAria();

  if (dict["meta.title"]) {
    document.title = dict["meta.title"];
  }
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && dict["meta.description"]) {
    metaDescription.setAttribute("content", dict["meta.description"]);
  }

  if (persist) {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (error) {
      /* storage unavailable — URL still carries the language */
    }
  }
  syncUrl(lang);
  return lang;
}

function readStoredLang() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

export function resolveInitialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (isSupported(fromUrl)) {
    return fromUrl;
  }
  const stored = readStoredLang();
  if (isSupported(stored)) {
    return stored;
  }
  return "en";
}

export function initLang() {
  return applyLang(resolveInitialLang(), { persist: false });
}
