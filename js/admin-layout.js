import { getJSON, API_BASE } from "./app.js";
import { toggleTheme } from "./theme.js";

async function prepareHeader() {
  const data = (await getJSON("/admin/me")).data;
  const nameElem = document.querySelector("header .text-sm.font-medium");
  const emailElem = document.querySelector("header .text-xs.text-slate-500");
  const phoneElem = document.querySelector(
    "header .text-xs.text-slate-500:nth-of-type(2)",
  );
  const name = document.getElementById("admin-name");
  const phone = document.getElementById("admin-phone");
  const email = document.getElementById("admin-email");
  if (nameElem) {
    nameElem.textContent = data.name || "Admin User";
    name.textContent = data.name || "Admin User";
  }
  if (phoneElem) {
    phoneElem.textContent = data.phoneNumber || data.phone || "";
    phone.textContent = data.phoneNumber || data.phone || "";
  }
  if (emailElem) {
    emailElem.textContent = data.email || "";
    email.textContent = data.email || "";
  }
}

function updateSidebarActiveLink(sidebar) {
  const currentPath = window.location.pathname;
  const navLinks = sidebar.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const icon = link.querySelector(".material-symbols-outlined");
    // Reset all links to inactive state first
    link.classList.remove(
      "bg-primary/10",
      "text-primary",
      "dark:bg-[#232f48]",
      "dark:text-white",
    );
    link.classList.add(
      "group",
      "text-slate-600",
      "hover:bg-slate-100",
      "dark:text-slate-400",
      "dark:hover:bg-slate-800",
      "dark:hover:text-white",
    );
    if (icon) {
      icon.classList.remove("icon-fill");
    }

    // Add active styles to the matching link
    if (link.getAttribute("href") === currentPath) {
      link.classList.add(
        "bg-primary/10",
        "text-primary",
        "dark:bg-[#232f48]",
        "dark:text-white",
      );
      link.classList.remove(
        "group",
        "text-slate-600",
        "hover:bg-slate-100",
        "dark:text-slate-400",
        "dark:hover:bg-slate-800",
        "dark:hover:text-white",
      );
      if (icon) {
        icon.classList.add("icon-fill");
      }
    }
  });
}

// Simple runtime injection to normalize admin sidebar + header across admin pages
const asideHtml = `
<aside class="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-[#111722] md:flex">
  <div class="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
    <div class="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
      <span class="material-symbols-outlined">calculate</span>
    </div>
    <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Math Admin</h1>
  </div>
  <div class="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
    <nav class="flex flex-col gap-2">
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/admin-dashboard.html">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="text-sm font-medium">Dashboard</span>
      </a>
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/manage-lessons.html">
        <span class="material-symbols-outlined">book_2</span>
        <span class="text-sm font-medium">Manage Lessons</span>
      </a>
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/manage-quizzes.html">
        <span class="material-symbols-outlined">quiz</span>
        <span class="text-sm font-medium">Manage Quizzes</span>
      </a>
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/admin-trash.html">
        <span class="material-symbols-outlined">delete</span>
        <span class="text-sm font-medium">Trash</span>
      </a>
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/manage-users.html">
        <span class="material-symbols-outlined">group</span>
        <span class="text-sm font-medium">Users Management</span>
      </a>
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/admin-leaderboard.html">
        <span class="material-symbols-outlined">leaderboard</span>
        <span class="text-sm font-medium">Leaderboard</span>
      </a>
    </nav>
    <nav class="flex flex-col gap-2 border-t border-slate-200 pt-6 dark:border-slate-800">
      <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/">
        <span class="material-symbols-outlined">logout</span>
        <span class="text-sm font-medium">Home</span>
      </a>
    </nav>
  </div>
</aside>
`;

const headerHtml = `
<header class="flex h-16 items-center justify-between border-b border-slate-200 bg-surface-light px-6 dark:border-slate-800 dark:bg-[#111722]">
  <div class="flex items-center gap-4 md:hidden">
    <button data-admin-menu-btn class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
      <span class="material-symbols-outlined">menu</span>
    </button>
    <span class="font-bold text-slate-900 dark:text-white">Math Admin</span>
  </div>
  <div class="hidden max-w-md flex-1 md:flex">
    <div class="relative w-full">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
      <input data-admin-search class="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-[#232f48] dark:text-white dark:placeholder-slate-400" placeholder="Search lessons, students, or quizzes..." type="text"/>
    </div>
  </div>
  <div class="flex items-center gap-4">
    
    <button data-theme-toggle class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
      <span class="material-symbols-outlined dark:hidden">dark_mode</span>
      <span class="material-symbols-outlined hidden dark:block">light_mode</span>
    </button>
    <div class="relative group">
      <button class="flex items-center gap-3 pl-2">
        <div class="text-right hidden md:block">
          <p class="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">admin@mathfalta.com</p>
        </div>
        <div class="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 bg-center bg-cover" data-alt="Admin user profile picture showing a placeholder avatar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAlXYaEVeHoTogkCqsZ_nXsz6ywYFxdgP7aZWCHthY3w5fZs9HHaSNaXuxeHWYJbEIVRE7bmsOQIYKAwmNG-E_3_wfuouNkfHptc_5ydKAP2EntLhYyABTcNcw6Nt84BGkJ_-yIgX_LJxdObkax6cvtV5CsLnM4JqNNMomVSQ1qXEwP-nWQLG8m70fwZqy5Ew4qYE30yiDpA7TENm84Rpa2wz-ydRiXLuP1wLpriQgE8giZyEyhO-Q5QjyHtQpRkEfQlDfiZ5_06nc");'></div>
      </button>
      <div class="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dark:border-slate-700 dark:bg-[#1e293b] z-50">
        <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
          <p class="text-sm font-semibold text-slate-900 dark:text-white" id="admin-name">Jane Admin</p>
          <p class="text-xs text-slate-500 dark:text-slate-400" id="admin-phone">+1 (555) 123-4567</p>
          <p class="text-xs text-slate-500 dark:text-slate-400" id="admin-email">admin@mathfalta.com</p>
        </div>
        <a class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" href="#" id="admin-signout-2">
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Sign out
        </a>
      </div>
    </div>
  </div>
</header>
`;

function htmlToFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function ensureMobileSidebar() {
  let overlay = document.getElementById("admin-mobile-overlay");
  let sidebar = document.getElementById("admin-mobile-sidebar");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "admin-mobile-overlay";
    overlay.className =
      "fixed inset-0 z-[110] bg-black/40 opacity-0 pointer-events-none transition-opacity";
    document.body.appendChild(overlay);
  }

  if (!sidebar) {
    sidebar = document.createElement("aside");
    sidebar.id = "admin-mobile-sidebar";
    sidebar.className =
      "fixed inset-y-0 left-0 z-[120] w-72 max-w-[85vw] translate-x-[-100%] bg-white dark:bg-[#111722] border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 flex flex-col";
    sidebar.innerHTML = `
      <div class="flex h-16 items-center justify-between gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
            <span class="material-symbols-outlined">calculate</span>
          </div>
          <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Math Admin</h1>
        </div>
        <button data-admin-close class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
        <nav class="flex flex-col gap-2">
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/admin-dashboard.html">
            <span class="material-symbols-outlined">dashboard</span>
            <span class="text-sm font-medium">Dashboard</span>
          </a>
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/manage-lessons.html">
            <span class="material-symbols-outlined">book_2</span>
            <span class="text-sm font-medium">Manage Lessons</span>
          </a>
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/manage-quizzes.html">
            <span class="material-symbols-outlined">quiz</span>
            <span class="text-sm font-medium">Manage Quizzes</span>
          </a>
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/admin-trash.html">
            <span class="material-symbols-outlined">delete</span>
            <span class="text-sm font-medium">Trash</span>
          </a>
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/manage-users.html">
            <span class="material-symbols-outlined">group</span>
            <span class="text-sm font-medium">Users Management</span>
          </a>
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/admin-leaderboard.html">
            <span class="material-symbols-outlined">leaderboard</span>
            <span class="text-sm font-medium">Leaderboard</span>
          </a>
        </nav>
        <nav class="flex flex-col gap-2 border-t border-slate-200 pt-6 dark:border-slate-800">
          <a class="group flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors" href="/">
            <span class="material-symbols-outlined">logout</span>
            <span class="text-sm font-medium">Home</span>
          </a>
        </nav>
      </div>
    `;
    document.body.appendChild(sidebar);
  }

  updateSidebarActiveLink(sidebar);

  const open = () => {
    sidebar.classList.remove("translate-x-[-100%]");
    sidebar.classList.add("translate-x-0");
    overlay.classList.remove("opacity-0", "pointer-events-none");
    overlay.classList.add("opacity-100");
    document.body.classList.add("overflow-hidden");
  };

  const close = () => {
    sidebar.classList.add("translate-x-[-100%]");
    sidebar.classList.remove("translate-x-0");
    overlay.classList.add("opacity-0", "pointer-events-none");
    overlay.classList.remove("opacity-100");
    document.body.classList.remove("overflow-hidden");
  };

  overlay.addEventListener("click", close);
  sidebar.querySelectorAll("[data-admin-close], nav a").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return { open, close };
}

export function insertAdminLayout() {
  // replace aside
  const existingAside = document.querySelector("aside");
  const newAside = htmlToFragment(asideHtml);

  // Highlight the active link in the sidebar
  updateSidebarActiveLink(newAside);

  if (existingAside) {
    existingAside.replaceWith(newAside);
  } else {
    // insert before first main or body first child
    const main = document.querySelector("main");
    if (main) main.parentNode.insertBefore(newAside, main);
    else document.body.insertBefore(newAside, document.body.firstChild);
  }

  // replace header (inside main) or top-level header
  const existingHeader = document.querySelector("main header, header");
  const newHeader = htmlToFragment(headerHtml);
  if (existingHeader) {
    existingHeader.replaceWith(newHeader);
  } else {
    const main2 = document.querySelector("main");
    if (main2) main2.parentNode.insertBefore(newHeader, main2);
    else document.body.insertBefore(newHeader, document.body.firstChild);
  }

  // wire sign-out buttons (optional) to clear cookie endpoint if available
  const signoutButtons = document.querySelectorAll(
    '#admin-signout, #admin-signout-2, [id^="signout"]',
  );
  signoutButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE}/auth/sign-out`, {
          method: "GET",
          credentials: "include",
        });
        localStorage.removeItem("isAdmin");
      } catch (err) {
        // ignore
      }
      window.location.href = "/";
    });
  });

  // Wire up global search
  const searchInput = newHeader.querySelector('input[type="text"]');
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `/admin-dashboard.html?q=${encodeURIComponent(
            query,
          )}`;
        }
      }
    });
  }

  // Mobile sidebar
  const mobileSidebar = ensureMobileSidebar();
  const menuBtn = newHeader.querySelector("[data-admin-menu-btn]");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => mobileSidebar.open());
  }

  const themeBtn = newHeader.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      toggleTheme();
    });
  }

  // prepare header with admin info
  prepareHeader();

  // notify listeners (filters can rebind after header replacement)
  window.dispatchEvent(new CustomEvent("admin-layout-ready"));
}

// Auto-run on module load
document.addEventListener("DOMContentLoaded", () => {
  insertAdminLayout();
});

// export { insertAdminLayout, prepareHeader, updateSidebarActiveLink };
export default { insertAdminLayout, prepareHeader, updateSidebarActiveLink };
