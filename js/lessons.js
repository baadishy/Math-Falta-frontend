import { getJSON } from "./app.js";

function timeAgo(dateStr) {
  const when = new Date(dateStr || Date.now());
  const diff = Date.now() - when.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hrs > 0) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  return `just now`;
}

async function loadLessons() {
  const container = document.getElementById("lessons-list");
  if (!container) return;

  // show skeleton while loading
  container.innerHTML = `<div class="grid gap-6"><div class="p-6 bg-white dark:bg-[#192233] rounded-2xl border border-slate-200 dark:border-[#232f48] animate-pulse h-64"></div><div class="p-6 bg-white dark:bg-[#192233] rounded-2xl border border-slate-200 dark:border-[#232f48] animate-pulse h-64"></div></div>`;

  try {
    const res = await getJSON("/lessons/");
    const lessons = res.data || [];

    if (!lessons.length) {
      container.innerHTML = `<div class="text-center p-8 text-slate-500 dark:text-slate-400">No lessons found</div>`;
      return;
    }

    container.innerHTML = "";
    lessons.forEach((lesson) => {
      const article = document.createElement("article");
      article.className =
        "bg-white dark:bg-[#192233] rounded-2xl border border-slate-200 dark:border-[#232f48] shadow-sm overflow-hidden";

      const header = document.createElement("div");
      header.className =
        "p-6 md:p-8 border-b border-slate-100 dark:border-[#232f48]";
      header.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
          <span class="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">${
            lesson.topic
          }</span>
          <span class="text-xs text-slate-400 dark:text-slate-500 font-bold">•</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Updated ${timeAgo(
            lesson.updatedAt
          )}</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">${
          lesson.title
        }</h2>
        <p class="text-slate-600 dark:text-slate-300 text-sm max-w-3xl">${
          lesson.description || ""
        }</p>
      `;

      // video as iframe
      const videoWrap = document.createElement("div");
      videoWrap.className = "w-full";
      const iframe = document.createElement("iframe");
      iframe.src = lesson.videoUrl;
      iframe.className =
        "w-full aspect-video rounded-md border border-slate-200 dark:border-[#232f48]";
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      // iframe.setAttribute("referrerpolicy", "no-referrer");
      iframe.setAttribute("loading", "lazy");
      iframe.title = lesson.title || "Lesson video";
      videoWrap.appendChild(iframe);

      // materials
      const mats = document.createElement("div");
      mats.className =
        "p-6 md:p-8 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-[#232f48]";
      const matsInner = document.createElement("div");
      matsInner.innerHTML = `
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">folder_open</span> Lesson Materials
        </h3>
      `;

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4";
      if (lesson.docs && lesson.docs.length) {
        lesson.docs.forEach((d) => {
          const a = document.createElement("a");
          a.className =
            "flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#232f48] bg-white dark:bg-[#192233] hover:border-primary dark:hover:border-primary/50 hover:shadow-md transition-all group/file";
          a.href = d.url;
          a.setAttribute("download", `${d.originalName || "document"}`);
          a.rel = "noopener noreferrer";
          a.innerHTML = `
            <div class="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">${
                d.label || d.originalName || "Document"
              }</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">${
                d.size || ""
              }</p>
            </div>
            <span class="material-symbols-outlined text-slate-400">download</span>
          `;
          grid.appendChild(a);
        });
      } else {
        grid.innerHTML = `<div class="text-slate-500 dark:text-slate-400 p-4">No lesson materials</div>`;
      }

      matsInner.appendChild(grid);
      mats.appendChild(matsInner);

      article.appendChild(header);
      article.appendChild(videoWrap);
      article.appendChild(mats);

      container.appendChild(article);
    });
  } catch (err) {
    console.error("Failed to load lessons", err);
    if (err.status === 401 || err.status === 403) {
      window.location.href = "/sign-in.html";
      return;
    }
    container.innerHTML = `<div class="text-center p-8 text-slate-500 dark:text-slate-400">Could not load lessons.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadLessons);
