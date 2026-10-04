import "./style.css";
import {
  applyLocale,
  otherLocale,
  readStoredLocale,
  resolveLocale,
  storeLocale,
  type Locale,
} from "./i18n";

let locale: Locale = resolveLocale(location.search, readStoredLocale());
applyLocale(locale);

document.getElementById("locale-toggle")?.addEventListener("click", () => {
  locale = otherLocale(locale);
  storeLocale(locale);
  const url = new URL(location.href);
  url.searchParams.set("lang", locale);
  history.replaceState(null, "", url);
  applyLocale(locale);
});

document.documentElement.dataset.ready = "true";
