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

// Native <dialog> provides Escape-to-close, focus trapping and focus return to the opener.
content.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const opener = target.closest<HTMLElement>("[data-open-dialog]");
  if (opener) {
    (document.getElementById(opener.dataset.openDialog!) as HTMLDialogElement | null)?.showModal();
    return;
  }
  if (target.closest("[data-close-dialog]")) {
    target.closest("dialog")?.close();
    return;
  }
  // A click on the backdrop (the dialog element itself, outside its content box) closes it.
  if (target instanceof HTMLDialogElement) target.close();
});

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
