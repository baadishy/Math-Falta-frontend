import { getJSON, putJSON, deleteJSON } from "./app.js";
import {
  showToast,
  showLoading,
  hideLoading,
  createConfirmationPrompt,
} from "./ui.js";

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
        <td class="py-4 px-6 align-middle text-sm font-bold text-slate-900 dark:text-white">${
          item.title
        }</td>
        <td class="py-4 px-6 align-middle text-sm text-slate-600 dark:text-slate-300">${
          item.grade
        }</td>
        <td class="py-4 px-6 align-middle text-sm text-slate-500 dark:text-slate-400">${formatDate(
          item.deletedAt,
        )}</td>
        <td class="py-4 px-6 align-middle text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="restore-item px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover" data-id="${
              item._id
            }" data-type="${item.type}">Restore</button>
            <button class="delete-item px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700" data-id="${
              item._id
            }" data-type="${item.type}">Delete Forever</button>
          </div>
        </td>
      </tr>
    `,
    )
    .join("");

  wireActions();
}

async function restoreItem(id, type) {
  const confirmed = await createConfirmationPrompt(
    "This item will be restored and visible again in the active list.",
  );
  if (!confirmed) return;
  showLoading("Restoring item...");
  try {
    const base = type === "lesson" ? "/admin/lessons" : "/admin/quizzes";
    await putJSON(`${base}/${id}/restore`);
    showToast("Item restored successfully", "success");
    await loadTrashData();
  } catch (err) {
    showToast(err?.payload?.message || "Failed to restore item.", "error");
  } finally {
    hideLoading();
  }
}

async function deleteForeverItem(id, type) {
  const confirmed = await createConfirmationPrompt(
    "This action cannot be undone.",
  );
  if (!confirmed) return;
  showLoading("Deleting item permanently...");
  try {
    const base = type === "lesson" ? "/admin/lessons" : "/admin/quizzes";
    await deleteJSON(`${base}/${id}`);
    showToast("Item deleted permanently", "success");
    await loadTrashData();
  } catch (err) {
    showToast(
      err?.payload?.message || "Failed to delete item permanently.",
      "error",
    );
  } finally {
    hideLoading();
  }
}

function wireActions() {
  document.querySelectorAll(".restore-item").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const type = e.currentTarget.dataset.type;
      if (!id || !type) return;
      await restoreItem(id, type);
    });
  });

  document.querySelectorAll(".delete-item").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      const type = e.currentTarget.dataset.type;
      if (!id || !type) return;
      await deleteForeverItem(id, type);
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
  showLoading("Loading trash...");
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
    showToast("Could not load trash data.", "error");
  } finally {
    hideLoading();
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
