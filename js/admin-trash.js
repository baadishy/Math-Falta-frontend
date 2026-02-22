import { getJSON, putJSON, deleteJSON } from "./app.js";

let deletedLessons = [];
let deletedQuizzes = [];

function normalizeItem(item, type) {
  return {
    _id: item._id,
    type,
    title: item.title || "Untitled",
    grade: item.grade || "-",
    deletedAt: item.deletedAt || item.updatedAt || item.createdAt,
  };
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function renderCounts() {
  const lessonsCountEl = document.getElementById("deleted-lessons-count");
  const quizzesCountEl = document.getElementById("deleted-quizzes-count");

  if (lessonsCountEl)
    lessonsCountEl.textContent = String(deletedLessons.length);
  if (quizzesCountEl)
    quizzesCountEl.textContent = String(deletedQuizzes.length);
}

function renderTable() {
  const tbody = document.getElementById("trash-table-body");
  if (!tbody) return;

  const items = [
    ...deletedLessons.map((item) => normalizeItem(item, "lesson")),
    ...deletedQuizzes.map((item) => normalizeItem(item, "quiz")),
  ].sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
          Trash is empty.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
      <tr class="hover:bg-slate-50 dark:hover:bg-[#1f293a] transition-colors">
        <td class="py-4 px-6 align-middle">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.type === "lesson"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          }">${item.type === "lesson" ? "Lesson" : "Quiz"}</span>
        </td>
        <td class="py-4 px-6 align-middle text-sm font-bold text-slate-900 dark:text-white">${item.title}</td>
        <td class="py-4 px-6 align-middle text-sm text-slate-600 dark:text-slate-300">${item.grade}</td>
        <td class="py-4 px-6 align-middle text-sm text-slate-500 dark:text-slate-400">${formatDate(item.deletedAt)}</td>
        <td class="py-4 px-6 align-middle text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="restore-item px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover" data-id="${item._id}" data-type="${item.type}">Restore</button>
            <button class="delete-item px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700" data-id="${item._id}" data-type="${item.type}">Delete Forever</button>
          </div>
        </td>
      </tr>
    `,
    )
    .join("");

  wireActions();
}

function createConfirmationPrompt({
  title,
  message,
  confirmLabel,
  confirmClass,
}) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50";
    modal.innerHTML = `
      <div class="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-6">
          <h3 class="text-lg font-bold">${title}</h3>
          <p class="text-sm text-slate-500 mt-2">${message}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 rounded-lg text-sm font-semibold text-white ${confirmClass}">${confirmLabel}</button>
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

async function restoreItem(id, type) {
  const confirmed = await createConfirmationPrompt({
    title: "Restore Item",
    message: "This item will be restored and visible again in the active list.",
    confirmLabel: "Restore",
    confirmClass: "bg-primary hover:bg-primary-hover",
  });
  if (!confirmed) return;

  const base = type === "lesson" ? "/admin/lessons" : "/admin/quizzes";
  await putJSON(`${base}/${id}/restore`);
  await loadTrashData();
}

async function deleteForeverItem(id, type) {
  const confirmed = await createConfirmationPrompt({
    title: "Delete Permanently",
    message: "This action cannot be undone.",
    confirmLabel: "Delete Forever",
    confirmClass: "bg-red-600 hover:bg-red-700",
  });
  if (!confirmed) return;

  const base = type === "lesson" ? "/admin/lessons" : "/admin/quizzes";
  await deleteJSON(`${base}/${id}`);
  await loadTrashData();
}

function wireActions() {
  document.querySelectorAll(".restore-item").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const type = e.currentTarget.dataset.type;
      if (!id || !type) return;

      try {
        await restoreItem(id, type);
      } catch (err) {
        console.error("Failed to restore item", err);
        alert(err?.payload?.message || "Failed to restore item.");
      }
    });
  });

  document.querySelectorAll(".delete-item").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const type = e.currentTarget.dataset.type;
      if (!id || !type) return;

      try {
        await deleteForeverItem(id, type);
      } catch (err) {
        console.error("Failed to delete item", err);
        alert(err?.payload?.message || "Failed to delete item.");
      }
    });
  });
}

async function loadTrashData() {
  const tbody = document.getElementById("trash-table-body");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
          Loading deleted items...
        </td>
      </tr>
    `;
  }

  try {
    const [lessonsRes, quizzesRes] = await Promise.all([
      getJSON("/admin/lessons/trash"),
      getJSON("/admin/quizzes/trash"),
    ]);

    deletedLessons = lessonsRes.data || [];
    deletedQuizzes = quizzesRes.data || [];

    renderCounts();
    renderTable();
  } catch (err) {
    console.error("Failed to load trash data", err);
    if (err.status === 401) {
      window.location.href = "sign-in.html";
      return;
    }

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-10 text-center text-red-500">
            Could not load trash data.
          </td>
        </tr>
      `;
    }
  }
}

function wireRefresh() {
  const refreshBtn = document.getElementById("refresh-trash");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", () => {
    loadTrashData();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireRefresh();
  loadTrashData();
});
