import { getText, type Locale } from "./i18n";

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "theme";

export function parseTheme(value: string | null | undefined): Theme | null {
  return value === "dark" || value === "light" ? value : null;
}

/** A stored choice beats the OS preference; with neither, the default is dark. */
export function resolveTheme(stored: string | null, osPrefersLight: boolean): Theme {
  return parseTheme(stored) ?? (osPrefersLight ? "light" : DEFAULT_THEME);
}

export function otherTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private windows); the choice then lasts for the page only.
  }
}

export const lightQuery = () => window.matchMedia("(prefers-color-scheme: light)");

export function applyTheme(theme: Theme, locale: Locale): void {
  document.documentElement.dataset.theme = theme;
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    const target = otherTheme(theme);
    const key = target === "light" ? "themeToLight" : "themeToDark";
    toggle.textContent = getText(`ui.${key}`, locale);
    toggle.setAttribute("aria-label", getText(`ui.${key}Label`, locale));
  }
}
