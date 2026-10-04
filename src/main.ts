import "./style.css";
import {
  applyLocale,
  otherLocale,
  readStoredLocale,
  resolveLocale,
  storeLocale,
  type Locale,
} from "./i18n";
import {
  applyTheme,
  lightQuery,
  otherTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  type Theme,
} from "./theme";

let locale: Locale = resolveLocale(location.search, readStoredLocale());
let theme: Theme = resolveTheme(readStoredTheme(), lightQuery().matches);

function render(): void {
  applyLocale(locale);
  applyTheme(theme, locale);
}
render();

document.getElementById("locale-toggle")?.addEventListener("click", () => {
  locale = otherLocale(locale);
  storeLocale(locale);
  const url = new URL(location.href);
  url.searchParams.set("lang", locale);
  history.replaceState(null, "", url);
  render();
});

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  theme = otherTheme(theme);
  storeTheme(theme);
  render();
});

// Without an explicit choice, follow live changes of the OS preference.
lightQuery().addEventListener("change", () => {
  if (readStoredTheme() !== null) return;
  theme = resolveTheme(null, lightQuery().matches);
  render();
});

document.documentElement.dataset.ready = "true";
