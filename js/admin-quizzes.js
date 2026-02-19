import { getJSON, putJSON, apiFetch } from "./app.js";

let allQuizzes = [];
let lastDeletedQuiz = null;
let pendingDeletes = []; // store _id of quizzes to delete when leaving page

function renderStatus(isDeleted) {
  if (isDeleted)
    return `<span class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20">Deleted</span>`;
  return `<span class="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/20">Active</span>`;
}

function renderQuizzes(quizzes) {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  quizzes.forEach((q) => {
    const tr = document.createElement("tr");
    tr.className =
      "group hover:bg-slate-50 dark:hover:bg-[#1c2433] transition-colors cursor-pointer";
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">${q.title}</td>
      <td class="px-6 py-4 text-sm text-slate-600 text-center dark:text-[#92a4c9]">${q.grade || ""}</td>
      <td class="px-6 py-4 text-sm">${renderStatus(q.isDeleted)}</td>
      <td class="px-6 py-4 text-sm text-slate-600 dark:text-[#92a4c9]">${new Date(q.updatedAt || q.createdAt).toLocaleString()}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button class="edit-btn p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-id="${q._id}" title="Edit">
            <span class="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button class="delete-btn p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-id="${q._id}" title="Delete">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      window.location.href = `/edit-quiz.html?id=${id}`;
    }),
  );

  tbody.querySelectorAll('tr').forEach((row, i) => {
    row.onclick = (e) => { 
      if (e.target.closest(".edit-btn") || e.target.closest(".delete-btn")) return;
      const id = row.querySelector(".edit-btn").dataset.id;
      if (!id) return;
      window.location.href = `/view-quiz.html?id=${id}`;
    }
  });

  tbody.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!id) return;

      const confirmed = await createConfirmationPrompt(
        "Delete this quiz? It can be restored later.",
      );
      if (!confirmed) return;

      // Soft delete locally
      const quiz = allQuizzes.find((q) => q._id === id);
      if (quiz && !quiz.isDeleted) {
        quiz.isDeleted = true;
        lastDeletedQuiz = quiz;
        pendingDeletes.push(quiz._id);
        applyFilters();
        showUndoSnackbar(quiz);
      }
    }),
  );
}

// Snackbar for undo
function showUndoSnackbar(quiz) {
  const existing = document.getElementById("undo-snackbar");
  if (existing) existing.remove();

  const snackbar = document.createElement("div");
  snackbar.id = "undo-snackbar";
  snackbar.className =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 animate-slide-up";
  snackbar.innerHTML = `
    <span>Quiz "${quiz.title}" deleted</span>
    <button id="undo-btn" class="text-primary font-semibold hover:underline">Undo</button>
  `;
  document.body.appendChild(snackbar);

  const undoBtn = snackbar.querySelector("#undo-btn");
  undoBtn.addEventListener("click", () => {
    if (lastDeletedQuiz) {
      lastDeletedQuiz.isDeleted = false;
      applyFilters();
      // Remove from pending deletes
      pendingDeletes = pendingDeletes.filter(
        (id) => id !== lastDeletedQuiz._id,
      );
      lastDeletedQuiz = null;
      snackbar.remove();
    }
  });

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (document.body.contains(snackbar)) snackbar.remove();
  }, 5000);
}

function applyFilters() {
  renderQuizzes(allQuizzes);
}

// Ctrl+Z undo keyboard shortcut
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    if (lastDeletedQuiz) {
      lastDeletedQuiz.isDeleted = false;
      pendingDeletes = pendingDeletes.filter(
        (id) => id !== lastDeletedQuiz._id,
      );
      applyFilters();
      lastDeletedQuiz = null;
    }
  }
});

async function sendPendingDeletes() {
  if (pendingDeletes.length === 0) return;
  try {
    for (const id of pendingDeletes) {
      await putJSON(`/admin/quizzes/${id}/delete`);
    }
    pendingDeletes = [];
  } catch (err) {
    console.error("Failed to commit pending deletes", err);
  }
}

// Send pending deletes when leaving the page
window.addEventListener("beforeunload", sendPendingDeletes);

async function loadQuizzes() {
  try {
    const res = await getJSON("/admin/quizzes");
    allQuizzes = res.data || [];
    renderQuizzes(allQuizzes);
  } catch (err) {
    console.error("Failed to load admin quizzes", err);
    if (err.status === 401) window.location.href = "/sign-in..html";
    const tbody = document.querySelector("tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-slate-500">Could not load quizzes.</td></tr>`;
    }
  }
}

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

function wireAdd() {
  const addBtn = document.getElementById("add-new-quiz-btn");
  if (!addBtn) return;
  addBtn.addEventListener("click", () => {
    window.location.href = "/add-new-quiz.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuizzes();
  wireAdd();
});
