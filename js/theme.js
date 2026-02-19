// Centralized theme toggling
const htmlEl = document.documentElement;
function applySavedTheme() {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    htmlEl.classList.add("dark");
  } else {
    htmlEl.classList.remove("dark");
  }
}
function toggleTheme() {
  if (htmlEl.classList.contains("dark")) {
    htmlEl.classList.remove("dark");
    localStorage.theme = "light";
  } else {
    htmlEl.classList.add("dark");
    localStorage.theme = "dark";
  }
  // Let other tabs/pages update immediately.
  document.dispatchEvent(new Event("theme-changed"));
}

applySavedTheme();
// Keep theme in sync across tabs/windows.
window.addEventListener("storage", (event) => {
  if (event.key === "theme" || event.key === null) {
    applySavedTheme();
    document.dispatchEvent(new Event("theme-changed"));
  }
});

// Upgrade legacy inline toggles to use localStorage-backed theme.
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll('[onclick*="classList.toggle(\'dark\')"]')
    .forEach((btn) => {
      btn.removeAttribute("onclick");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });
});
export { toggleTheme, applySavedTheme };
