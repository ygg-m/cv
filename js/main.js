/**
 * main.js — theme, navigation, progressive disclosure ("More" toggles),
 * language switch and small dynamic bits (age, current year).
 */
import { applyLang, getLang, initLang, t } from "./i18n.js";

const THEME_STORAGE_KEY = "theme";

/* ---------- Theme (dark / light) ---------- */

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") || systemTheme();
}

function updateThemeLabel() {
  const button = document.querySelector(".theme-toggle");
  if (!button) {
    return;
  }
  // The label describes the action: which theme clicking will switch to.
  const next = getTheme() === "dark" ? "light" : "dark";
  button.dataset.i18nAria = next === "light" ? "theme.toLight" : "theme.toDark";
  button.setAttribute("aria-label", t(button.dataset.i18nAria));
}

function setTheme(theme, persist) {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      /* storage unavailable — theme still applies to this visit */
    }
  }
  updateThemeLabel();
}

function hasStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light";
  } catch (error) {
    return false;
  }
}

function initTheme() {
  const button = document.querySelector(".theme-toggle");
  if (button) {
    button.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark", true);
    });
  }
  // Follow the OS while the user hasn't explicitly chosen a theme.
  if (!hasStoredTheme()) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      setTheme(event.matches ? "dark" : "light", false);
    });
  }
  updateThemeLabel();
}

/* ---------- Mobile navigation ---------- */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!toggle || !menu) {
    return;
  }
  const close = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      close();
    } else {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
}

/* ---------- Progressive disclosure ("More" buttons) ---------- */

function initMoreToggles() {
  document.querySelectorAll(".more-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.getAttribute("aria-controls"));
      if (!target) {
        return;
      }
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      target.hidden = expanded;
      // Keep the key in sync so language switches respect the current state.
      button.dataset.i18n = expanded ? "more.show" : "more.hide";
      button.textContent = t(button.dataset.i18n);
    });
  });
}

/* ---------- Language switch ---------- */

function updateLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === getLang()));
  });
}

function initLangSwitch() {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const lang = button.dataset.lang;
      if (lang === getLang()) {
        return;
      }
      await applyLang(lang, { persist: true });
      updateLangButtons();
    });
  });
}

/* ---------- Dynamic bits ---------- */

function initDates() {
  const ageElement = document.getElementById("age");
  if (ageElement) {
    const birthday = new Date("1995-08-03");
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age -= 1;
    }
    ageElement.textContent = String(age);
  }
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}

/* ---------- Boot ---------- */

async function boot() {
  initDates();
  initTheme();
  initNav();
  initMoreToggles();
  await initLang();
  updateLangButtons();
  initLangSwitch();
}

boot().catch((error) => {
  // Surface startup failures loudly: the smoke suite fails on console errors.
  console.error("Failed to initialize the page:", error);
});
