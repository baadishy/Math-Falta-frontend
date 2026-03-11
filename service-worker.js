/*
  Math-Falta Service Worker
  - Cache-first for static assets (JS, CSS, images, fonts)
  - Network-first for HTML pages with offline fallback
  - Versioned caches with cleanup + update signalling
*/

const CACHE_VERSION = "v3-20260311";
const STATIC_CACHE = `math-falta-static-${CACHE_VERSION}`;
const PAGE_CACHE = `math-falta-pages-${CACHE_VERSION}`;
const RUNTIME_CACHE = `math-falta-runtime-${CACHE_VERSION}`;

// Pages to keep available offline
const PAGE_URLS = [
  "/",
  "/index.html",
  "/offline.html",
  "/add-new-lesson.html",
  "/add-new-quiz.html",
  "/admin-approvals.html",
  "/admin-dashboard.html",
  "/admin-leaderboard.html",
  "/admin-trash.html",
  "/edit-lesson.html",
  "/edit-quiz.html",
  "/lessons.html",
  "/manage-lessons.html",
  "/manage-quizzes.html",
  "/manage-user.html",
  "/manage-users.html",
  "/quiz-result.html",
  "/quiz.html",
  "/quizzes.html",
  "/sign-in.html",
  "/sign-up.html",
  "/user-dashboard.html",
  "/view-quiz.html",
  "/view-report.html",
  "/welcome.html",
];

// Static assets (relative to site root)
const ASSET_URLS = [
  "/manifest.json",
  "/app-config.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/030c6fbc-f3a4-4e31-9740-d6e473b244a9.jpg",
  "/49dbe4ef-dc60-47e6-b606-d658082a0c2f.jpg",
  "/83518886-ada2-4ece-bca2-ae1ee4cec296.jpg",
  "/WhatsApp Image 2026-02-06 at 6.51.46 PM.jpeg",
  "/js/add-edit-lesson.js",
  "/js/add-quiz.js",
  "/js/admin-approvals.js",
  "/js/admin-dashboard.js",
  "/js/admin-layout.js",
  "/js/admin-leaderboard.js",
  "/js/admin-lessons.js",
  "/js/admin-quizzes.js",
  "/js/admin-trash.js",
  "/js/admin-users.js",
  "/js/app.js",
  "/js/auth.js",
  "/js/dashboard.js",
  "/js/edit-quiz.js",
  "/js/firebase-config.js",
  "/js/firebase-uploader.js",
  "/js/header.js",
  "/js/lessons.js",
  "/js/manage-user.js",
  "/js/quiz-result.js",
  "/js/quiz.js",
  "/js/quizzes.js",
  "/js/theme.js",
  "/js/ui.js",
  "/js/view-quiz.js",
  "/js/view-report.js",
];

// External assets that we try to cache but don't block install if they fail
const OPTIONAL_EXTERNALS = [
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Inter:wght@400;500;600&display=swap",
  "https://fonts.gstatic.com",
  "https://unpkg.com/@phosphor-icons/web",
  "https://cdn.tailwindcss.com?plugins=forms,typography",
];

// Utility to normalise URLs
const sameOrigin = (url) => url.origin === self.location.origin;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll([...PAGE_URLS, ...ASSET_URLS]);

      const pageCache = await caches.open(PAGE_CACHE);
      await pageCache.addAll(PAGE_URLS);

      const runtimeCache = await caches.open(RUNTIME_CACHE);
      await Promise.all(
        OPTIONAL_EXTERNALS.map((url) =>
          runtimeCache.add(
            new Request(url, { mode: "no-cors", credentials: "omit" })
          ).catch((err) => console.warn("Optional cache skipped:", url, err))
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("math-falta-") &&
              ![STATIC_CACHE, PAGE_CACHE, RUNTIME_CACHE].includes(key)
          )
          .map((oldKey) => caches.delete(oldKey))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets and common request types
  const cacheableAsset =
    sameOrigin(url) &&
    (ASSET_URLS.includes(url.pathname) || PAGE_URLS.includes(url.pathname));

  const cacheableByType = ["style", "script", "image", "font"].includes(
    request.destination
  );

  if (cacheableAsset || cacheableByType) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: try network, fall back to cache if available
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return cached || (request.destination === "document"
      ? caches.match("/offline.html")
      : Response.error());
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(PAGE_CACHE);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || caches.match("/offline.html");
  }
}
