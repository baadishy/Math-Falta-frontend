import { getJSON, putJSON } from "./app.js";

let allLessons = [];
let lastDeletedLesson = null;
let pendingDeletes = []; // store _id of lessons to delete when leaving page
let searchBound = false;

async function loadLessons() {
  try {
    const res = await getJSON("/admin/lessons");
    allLessons = res.data || [];
    applyFilters();
  } catch (err) {
    console.error("Failed to load lessons", err);
    if (err.status === 401) window.location.href = "sign-in.html";
  }
}

// Apply filters & render
function applyFilters() {
  const searchInput = document.querySelector("[data-admin-search]");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  const filteredLessons = allLessons.filter(
    (l) =>
      l.title.toLowerCase().includes(searchTerm) ||
      (l.topic && l.topic.toLowerCase().includes(searchTerm)),
  );

  renderLessons(filteredLessons);
}

function renderLessons(lessons) {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  lessons.forEach((l) => {
    const tr = document.createElement("tr");
    // Add red background if deleted
    tr.className =
      "group transition-colors " +
      (l.isDeleted
        ? "bg-red-50 dark:bg-red-900/30 line-through"
        : "hover:bg-slate-50 dark:hover:bg-[#1f293a]");

    // Calculate watched percentage
    const watchedPercentage =
      l.totalUsers > 0 ? Math.round((l.watchedBy / l.totalUsers) * 100) : 0;

    tr.innerHTML = `
    <td class="py-4 px-6 align-middle">
      <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
        <span class="material-symbols-outlined">functions</span>
      </div>
    </td>
    <td class="py-4 px-6 align-middle">
      <p class="text-sm font-bold text-slate-900 dark:text-white">${l.title}</p>
      <p class="text-xs text-slate-500 dark:text-text-secondary-dark mt-0.5 truncate max-w-xs">${l.topic || ""}</p>
    </td>
    <td class="py-4 px-6 align-middle">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${l.isDeleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"}">${l.grade || ""}</span>
    </td>
    <td class="py-4 px-6 align-middle text-center">
      <div class="flex flex-col items-center gap-1 text-xs font-medium text-slate-500 dark:text-text-secondary-dark">
        <span>${l.watchedBy || 0} / ${l.totalUsers || 0} users</span>
        <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div class="bg-primary h-2" style="width: ${watchedPercentage}%;"></div>
        </div>
        <span>${watchedPercentage}%</span>
      </div>
    </td>
    <td class="py-4 px-6 align-middle">
      <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-text-secondary-dark">
        <span class="material-symbols-outlined text-[16px]">schedule</span>
        <span>${new Date(l.updatedAt || l.createdAt).toLocaleDateString()}</span>
      </div>
    </td>
    <td class="py-4 px-6 align-middle text-right">
      <div class="flex items-center justify-end gap-2">
        <button class="edit-lesson p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-id="${l._id}">
          <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
        </button>
        <button class="delete-lesson p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-id="${l._id}">
          <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
        </button>
      </div>
    </td>
  `;

    tbody.appendChild(tr);
  });

  // Edit buttons
  document.querySelectorAll(".edit-lesson").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      window.location.href = `edit-lesson.html?id=${id}`;
    }),
  );

  // Delete buttons
  document.querySelectorAll(".delete-lesson").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;

      const confirmed = await createConfirmationPrompt(
        "Delete this lesson? It can be restored later.",
      );
      if (!confirmed) return;

      // Soft delete locally
      const lesson = allLessons.find((l) => l._id === id);
      if (lesson && !lesson.isDeleted) {
        lesson.isDeleted = true;
        lastDeletedLesson = lesson;
        pendingDeletes.push(lesson._id);
        applyFilters();
        showUndoSnackbar(lesson);
      }
    }),
  );
}

// Snackbar for undo
function showUndoSnackbar(lesson) {
  const existing = document.getElementById("undo-snackbar");
  if (existing) existing.remove();

  const snackbar = document.createElement("div");
  snackbar.id = "undo-snackbar";
  snackbar.className =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 animate-slide-up";
  snackbar.innerHTML = `
    <span>Lesson "${lesson.title}" deleted</span>
    <button id="undo-btn" class="text-primary font-semibold hover:underline">Undo</button>
  `;
  document.body.appendChild(snackbar);

  const undoBtn = snackbar.querySelector("#undo-btn");
  undoBtn.addEventListener("click", () => {
    if (lastDeletedLesson) {
      lastDeletedLesson.isDeleted = false;
      applyFilters();
      // Remove from pending deletes
      pendingDeletes = pendingDeletes.filter(
        (id) => id !== lastDeletedLesson._id,
      );
      lastDeletedLesson = null;
      snackbar.remove();
    }
  });

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (document.body.contains(snackbar)) snackbar.remove();
  }, 5000);
}

// Ctrl+Z undo keyboard shortcut
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    if (lastDeletedLesson) {
      lastDeletedLesson.isDeleted = false;
      pendingDeletes = pendingDeletes.filter(
        (id) => id !== lastDeletedLesson._id,
      );
      applyFilters();
      lastDeletedLesson = null;
    }
  }
});

// Send pending deletes when leaving the page
async function sendPendingDeletes() {
  if (pendingDeletes.length === 0) return;
  try {
    for (const id of pendingDeletes) {
      await putJSON(`/admin/lessons/${id}/delete`);
    }
    pendingDeletes = [];
  } catch (err) {
    console.error("Failed to commit pending deletes", err);
  }
}
window.addEventListener("beforeunload", sendPendingDeletes);

// Confirmation modal
function createConfirmationPrompt(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50";
    modal.innerHTML = `
      <div class="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-6">
          <h3 class="text-lg font-bold">Confirm Deletion</h3>
          <p class="text-sm text-slate-500 mt-2">${message}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector("#confirm-btn");
    const cancelBtn = modal.querySelector("#cancel-btn");

    confirmBtn.addEventListener("click", () => {
      document.body.removeChild(modal);
      resolve(true);
    });

    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(modal);
      resolve(false);
    });
  });
}

// Add Lesson button
function wireAddLesson() {
  const btn = document.querySelector("button.bg-primary");
  if (btn && btn.textContent.includes("+ Add Lesson")) {
    btn.addEventListener(
      "click",
      () => (window.location.href = "add-new-lesson.html"),
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadLessons();
  wireAddLesson();
  wireSearchInput();
});

function wireSearchInput() {
  if (searchBound) return;
  const searchInput = document.querySelector("[data-admin-search]");
  if (!searchInput) return;
  searchInput.addEventListener("input", applyFilters);
  searchBound = true;
}

window.addEventListener("admin-layout-ready", () => {
  searchBound = false;
  wireSearchInput();
});
