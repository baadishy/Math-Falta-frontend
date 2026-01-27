import { getJSON, putJSON, apiFetch } from "./app.js";

function renderStatus(isDeleted) {
  if (isDeleted)
    return `<span class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20">Deleted</span>`;
  return `<span class="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/20">Active</span>`;
}

async function loadQuizzes() {
  try {
    const res = await getJSON("/admin/quizzes");
    const quizzes = res.data || [];
    const tbody = document.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    quizzes.forEach((q) => {
      const tr = document.createElement("tr");
      tr.className =
        "group hover:bg-slate-50 dark:hover:bg-[#1c2433] transition-colors";
      tr.innerHTML = `
        <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">${
          q.title
        }</td>
        <td class="px-6 py-4 text-sm text-slate-600 text-center dark:text-[#92a4c9]">${
          q.grade || ""
        }</td>
        <td class="px-6 py-4 text-sm">${renderStatus(false)}</td>
        <td class="px-6 py-4 text-sm text-slate-600 dark:text-[#92a4c9]">${new Date(
          q.updatedAt || q.createdAt
        ).toLocaleString()}</td>
        <td class="px-6 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="edit-btn p-1.5 rounded-md text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-id="${
              q._id
            }" title="Edit">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button class="delete-btn p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-id="${
              q._id
            }" title="Delete">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        window.location.href = `/edit-quiz.html?id=${id}`;
      })
    );

    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;

        const confirmed = await createConfirmationPrompt(
          "Delete this quiz? It can be restored later."
        );
        if (!confirmed) return;

        try {
          await putJSON(`/admin/quizzes/${id}/delete`);
          await loadQuizzes();
        } catch (err) {
          console.error(err);
          alert(err.message || err.payload?.message || "Delete failed");
        }
      })
    );
  } catch (err) {
    console.error("Failed to load admin quizzes", err);
    if (err.status === 401) window.location.href = "/sign-in.html";
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
