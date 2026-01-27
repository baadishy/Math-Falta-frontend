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
}

applySavedTheme();
export { toggleTheme, applySavedTheme };
