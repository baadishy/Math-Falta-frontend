import { toggleTheme, applySavedTheme } from "./theme.js";
import { API_BASE } from "./app.js";

// Build standard header HTML for student pages
function makeHeader() {
  const html = `
  <div class="max-w-[1200px] mx-auto w-full">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-3 text-slate-900 dark:text-white cursor-pointer">
        <div class="size-9 flex items-center justify-center text-primary bg-primary/10 rounded-lg">
          <span class="material-symbols-outlined !text-2xl">calculate</span>
        </div>
        <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Math-Falta</h2>
      </div>
      <nav class="hidden min-[500px]:flex items-center gap-2">
        <a data-nav="dashboard" href="/user-dashboard.html"
          class="nav-link text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors">
          <span class="material-symbols-outlined !text-xl">dashboard</span>
          <span class="hidden md:inline">Dashboard</span>
        </a>
        <a data-nav="lessons" href="/lessons.html"
          class="nav-link text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors">
          <span class="material-symbols-outlined !text-xl">school</span>
          <span class="hidden md:inline">My Lessons</span>
        </a>
        <a data-nav="practice" href="/quizzes.html"
          class="nav-link text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors">
          <span class="material-symbols-outlined !text-xl">edit_note</span>
          <span class="hidden md:inline">Practice</span>
        </a>
        <a data-nav="results" href="/quiz-result.html"
          class="nav-link text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors">
          <span class="material-symbols-outlined !text-xl">bar_chart</span>
          <span class="hidden md:inline">Results</span>
        </a>
      </nav>
      <div class="flex items-center gap-3">
        <button aria-label="Toggle Theme" data-theme-toggle class="flex items-center justify-center size-10 rounded-lg text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" type="button">
          <span id="theme-icon" class="material-symbols-outlined">light_mode</span>
        </button>
        <div class="relative">
          <button data-profile-toggle class="group flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-full transition-colors" aria-expanded="false" aria-haspopup="true">
            <div class="size-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-primary dark:text-indigo-200 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <span class="profile-initials-placeholder inline-block w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-900/60 animate-pulse"></span>
              <span class="text-xs font-bold profile-initials real hidden">ST</span>
            </div>
            <div class="hidden lg:flex flex-col items-start leading-none">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Student</span>
              <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
                <span class="profile-display-placeholder inline-block animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-20 h-3"></span>
                <span class="profile-display-name real hidden">Student</span>
              </span>
            </div>
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-lg">expand_more</span>
          </button>
          <div data-profile-menu class="absolute right-0 top-full mt-2 w-64 md:w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 opacity-0 pointer-events-none transition-all duration-200 transform origin-top-right z-50 max-h-[70vh] overflow-y-auto">
            <div class="p-4 border-b border-slate-100 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722]/50">
              <p class="text-sm font-bold text-slate-900 dark:text-white profile-name">
                <span class="profile-name-placeholder inline-block w-36 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></span>
                <span class="profile-name-real real hidden">Student Name</span>
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 profile-email">
                <span class="profile-email-placeholder inline-block w-40 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></span>
                <span class="profile-email-real real hidden">student@math-falta.edu</span>
              </p>
            </div>
            <div class="p-4 border-b border-slate-100 dark:border-[#232f48]">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</p>
              <div class="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div class="size-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-lg">phone</span>
                </div>
                <div>
                  <p class="font-medium">Parent's Phone</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 profile-parent">
                    <span class="profile-parent-placeholder inline-block w-32 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></span>
                    <span class="profile-parent-real real hidden">+1 (555) 123-4567</span>
                  </p>
                </div>
              </div>
            </div>
            <div class="p-2">
              <a class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary rounded-lg transition-colors" href="/index.html">
                <span class="material-symbols-outlined text-xl">home</span>
                Home
              </a>
              <a class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary rounded-lg transition-colors" href="/user-dashboard.html">
                <span class="material-symbols-outlined text-xl">settings</span>
                Settings
              </a>
              <div class="h-px bg-slate-100 dark:bg-[#232f48] my-1"></div>
              <a id="signin-btn" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary dark:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden" href="/sign-in.html">
                <span class="material-symbols-outlined text-xl">login</span>
                Sign In
              </a>
              <a id="signout-btn" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" href="#">
                <span class="material-symbols-outlined text-xl">logout</span>
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="min-[500px]:hidden border-t border-slate-200 dark:border-[#232f48] pt-2 pb-1">
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <a data-nav="dashboard" class="mobile-nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary" href="/user-dashboard.html">
          <span class="material-symbols-outlined !text-lg">dashboard</span>
          Dashboard
        </a>
        <a data-nav="lessons" class="mobile-nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary" href="/lessons.html">
          <span class="material-symbols-outlined !text-lg">school</span>
          Lessons
        </a>
        <a data-nav="practice" class="mobile-nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary" href="/quizzes.html">
          <span class="material-symbols-outlined !text-lg">edit_note</span>
          Practice
        </a>
        <a data-nav="results" class="mobile-nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary" href="/quiz-result.html">
          <span class="material-symbols-outlined !text-lg">bar_chart</span>
          Results
        </a>
      </div>
    </div>
  `;
  return html;
}

function updateThemeIcon() {
  const icon = document.getElementById("theme-icon");
  if (!icon) return;
  const dark = document.documentElement.classList.contains("dark");
  icon.textContent = dark ? "dark_mode" : "light_mode";
}

function insertHeader() {
  // If a header with data-inject-header exists, fill it, otherwise replace first header
  let header = document.querySelector("header[data-inject-header]");
  if (!header) {
    const firstHeader = document.querySelector("header");
    if (firstHeader) {
      header = firstHeader;
      header.dataset.injectHeader = "1";
    } else {
      // create one at top of body
      header = document.createElement("header");
      header.dataset.injectHeader = "1";
      document.body.insertBefore(header, document.body.firstChild);
    }
  }
  header.className =
    "relative z-50 border-b border-solid border-[#e5e7eb] dark:border-[#232f48] px-4 md:px-10 bg-white/90 dark:bg-[#111722]/90 backdrop-blur-sm sticky top-0";
  header.innerHTML = makeHeader();

  // Wire theme icon
  updateThemeIcon();
  document.addEventListener("theme-changed", updateThemeIcon);

  // Theme toggle button
  const btn = header.querySelector("[data-theme-toggle]");
  if (btn) {
    btn.addEventListener("click", () => {
      toggleTheme();
      updateThemeIcon();
      // dispatch global event in case other parts need it
      document.dispatchEvent(new Event("theme-changed"));
    });
  }

  // Sign out
  const signoutBtn = header.querySelector("#signout-btn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        // Server expects GET for sign-out
        await fetch(`${API_BASE}/auth/sign-out`, { credentials: "include" });
      } catch (err) {
        // ignore errors
      }
      // After sign out, go to sign-in page
      window.location.href = "/sign-in.html";
    });
  }

  // Sign in button (shown when unauthenticated)
  const signinBtn = header.querySelector("#signin-btn");
  if (signinBtn) {
    signinBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/sign-in.html";
    });
  }

  // Try to populate the profile snippet with user data if authenticated
  (async () => {
    const headerRoot = header;
    const signInBtn = headerRoot.querySelector("#signin-btn");
    const signOutBtn = headerRoot.querySelector("#signout-btn");

    const showSignedOutUI = () => {
      // Show Sign In, hide Sign Out, keep placeholders
      if (signInBtn) signInBtn.classList.remove("hidden");
      if (signOutBtn) signOutBtn.classList.add("hidden");
      // Keep placeholders visible (they are default)
    };

    const showSignedInUI = () => {
      // Hide Sign In, show Sign Out
      if (signInBtn) signInBtn.classList.add("hidden");
      if (signOutBtn) signOutBtn.classList.remove("hidden");
    };

    const publicPaths = [
      "/sign-in.html",
      "/sign-up.html",
      "/index.html",
      "/",
      "/welcome.html",
    ];
    const curPath = window.location.pathname || "/";

    try {
      // while fetching, the placeholders are visible (animated)
      const res = await fetch(`${API_BASE}/users/header`, {
        credentials: "include",
      });

      // If unauthorized, redirect to sign-in on protected pages; otherwise show Sign In link
      if (res.status === 401 || res.status === 403) {
        if (!publicPaths.includes(curPath)) {
          window.location.href = "/sign-in.html";
          return;
        }
        showSignedOutUI();
        return;
      }

      if (!res.ok) {
        // unknown non-auth error — show sign in for public pages
        showSignedOutUI();
        return;
      }

      const payload = await res.json();
      const user = payload?.data;
      if (!user) {
        // No user in payload — treat as signed out
        if (!publicPaths.includes(curPath)) {
          window.location.href = "/sign-in.html";
          return;
        }
        showSignedOutUI();
        return;
      }

      // We have a user — populate the UI and reveal real values
      const nameEls = headerRoot.querySelectorAll(
        ".profile-name-real, .profile-display-name.real",
      );
      nameEls.forEach((el) => {
        el.textContent = user.name || user.username || "Student";
        el.classList.remove("hidden");
      });
      // Also update any global legacy placeholders that other scripts/pages may target
      document
        .querySelectorAll(".profile-name")
        .forEach(
          (el) => (el.textContent = user.name || user.username || "Student"),
        );
      document
        .querySelectorAll(".profile-display-name")
        .forEach(
          (el) => (el.textContent = user.name || user.username || "Student"),
        );

      // hide placeholders
      const namePlaceholders = headerRoot.querySelectorAll(
        ".profile-name-placeholder, .profile-display-placeholder",
      );
      namePlaceholders.forEach((el) => el.classList.add("hidden"));

      const emailEls = headerRoot.querySelectorAll(".profile-email-real");
      emailEls.forEach((el) => {
        el.textContent = user.email || "";
        el.classList.remove("hidden");
      });
      // Global legacy email placeholders
      document
        .querySelectorAll(".profile-email")
        .forEach((el) => (el.textContent = user.email || ""));
      headerRoot
        .querySelectorAll(".profile-email-placeholder")
        .forEach((el) => el.classList.add("hidden"));

      const parentEls = headerRoot.querySelectorAll(".profile-parent-real");
      parentEls.forEach((el) => {
        el.textContent = user.parentNumber || "";
        el.classList.remove("hidden");
      });
      // Global legacy parent selectors
      document
        .querySelectorAll(".profile-parent")
        .forEach((el) => (el.textContent = user.parentNumber || ""));
      headerRoot
        .querySelectorAll(".profile-parent-placeholder")
        .forEach((el) => el.classList.add("hidden"));

      const initialsReal = headerRoot.querySelector(".profile-initials.real");
      const initialsPlaceholder = headerRoot.querySelector(
        ".profile-initials-placeholder",
      );
      if (initialsReal) {
        const initials = (user.name || user.username || "")
          .split(" ")
          .map((n) => (n ? n[0] : ""))
          .slice(0, 2)
          .join("")
          .toUpperCase();
        if (initials) initialsReal.textContent = initials;
        initialsReal.classList.remove("hidden");
      }
      if (initialsPlaceholder) initialsPlaceholder.classList.add("hidden");

      // Show sign-out; hide sign-in
      showSignedInUI();
    } catch (e) {
      // Network error — show sign in UI for public pages and redirect on protected pages
      if (!publicPaths.includes(curPath)) {
        window.location.href = "/sign-in.html";
        return;
      }
      if (signInBtn) signInBtn.classList.remove("hidden");
      if (signOutBtn) signOutBtn.classList.add("hidden");
    }
  })();
}

function highlightActiveNav() {
  const path = window.location.pathname;

  const map = {
    "/user-dashboard.html": "dashboard",
    "/lessons.html": "lessons",
    "/lesson.html": "lessons",
    "/quizzes.html": "practice",
    "/quiz.html": "practice",
    "/quiz-result.html": "results",
  };

  const activeKey = Object.keys(map).find((p) => path.startsWith(p));

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("text-primary", "bg-primary/5", "font-bold");
    link.classList.add(
      "text-slate-600",
      "dark:text-slate-300",
      "hover:text-primary",
      "dark:hover:text-primary",
    );
  });

  if (!activeKey) return;

  const activeNav = map[activeKey];
  const activeEl = document.querySelector(`.nav-link[data-nav="${activeNav}"]`);

  if (activeEl) {
    activeEl.classList.remove("text-slate-600", "dark:text-slate-300");
    activeEl.classList.add("text-primary", "bg-primary/5", "font-bold");
  }

  // Mobile sidebar active state
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.classList.remove("text-primary", "bg-primary/10", "font-semibold");
    link.classList.add("text-slate-700", "dark:text-slate-200");
  });
  const activeMobile = document.querySelector(
    `.mobile-nav-link[data-nav="${activeNav}"]`,
  );
  if (activeMobile) {
    activeMobile.classList.remove("text-slate-700", "dark:text-slate-200");
    activeMobile.classList.add(
      "text-primary",
      "bg-primary/10",
      "font-semibold",
    );
  }
}

// Auto-run on module load
applySavedTheme();
// Ensure smooth scrolling across pages
document.documentElement.classList.add("scroll-smooth");
insertHeader();
highlightActiveNav();

// Wire legacy buttons that exist on the original index page (if present)
const legacyThemeBtn = document.getElementById("theme-toggle");
if (legacyThemeBtn) {
  legacyThemeBtn.addEventListener("click", () => {
    toggleTheme();
    updateThemeIcon();
    document.dispatchEvent(new Event("theme-changed"));
  });
}
const legacyMobileThemeBtn = document.getElementById("mobile-theme-toggle");
if (legacyMobileThemeBtn) {
  legacyMobileThemeBtn.addEventListener("click", () => {
    toggleTheme();
    updateThemeIcon();
    document.dispatchEvent(new Event("theme-changed"));
  });
}

// Profile dropdown (all screen sizes)
const profileToggle = document.querySelector("[data-profile-toggle]");
const profileMenu = document.querySelector("[data-profile-menu]");

const closeProfileMenu = () => {
  if (!profileMenu || !profileToggle) return;
  profileMenu.classList.remove("opacity-100", "pointer-events-auto");
  profileMenu.classList.add("opacity-0", "pointer-events-none");
  profileToggle.setAttribute("aria-expanded", "false");
};

const openProfileMenu = () => {
  if (!profileMenu || !profileToggle) return;
  profileMenu.classList.add("opacity-100", "pointer-events-auto");
  profileMenu.classList.remove("opacity-0", "pointer-events-none");
  profileToggle.setAttribute("aria-expanded", "true");
};

if (profileToggle && profileMenu) {
  profileToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (profileMenu.classList.contains("opacity-100")) closeProfileMenu();
    else openProfileMenu();
  });

  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target) && !profileToggle.contains(e.target)) {
      closeProfileMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProfileMenu();
  });

  profileMenu.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", closeProfileMenu);
  });
}
export { insertHeader, updateThemeIcon };
