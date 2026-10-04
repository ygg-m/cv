import "./style.css";
import { renderContent } from "./render";
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

const content = document.getElementById("content")!;

function render(): void {
  // The build pre-renders English; only re-render when the Locale differs from what is on screen.
  if (content.dataset.locale !== locale) {
    content.innerHTML = renderContent(locale);
    content.dataset.locale = locale;
  }
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
