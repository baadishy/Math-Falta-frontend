import { getJSON, putJSON } from "./app.js";

async function loadLessons() {
  try {
    const res = await getJSON("/admin/lessons");
    const lessons = res.data || [];
    const tbody = document.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    lessons.forEach((l) => {
      const tr = document.createElement("tr");
      tr.className =
        "group hover:bg-slate-50 dark:hover:bg-[#1f293a] transition-colors";
      tr.innerHTML = `
        <td class="py-4 px-6 align-middle">
          <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">functions</span>
          </div>
        </td>
        <td class="py-4 px-6 align-middle">
          <p class="text-sm font-bold text-slate-900 dark:text-white">${
            l.title
          }</p>
          <p class="text-xs text-slate-500 dark:text-text-secondary-dark mt-0.5 truncate max-w-xs">${
            l.topic || ""
          }</p>
        </td>
        <td class="py-4 px-6 align-middle">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">${
            l.grade || ""
          }</span>
        </td>
        <td class="py-4 px-6 align-middle">
          <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-text-secondary-dark">
            <span class="material-symbols-outlined text-[16px]">schedule</span>
            <span>${new Date(
              l.updatedAt || l.createdAt
            ).toLocaleDateString()}</span>
          </div>
        </td>
        <td class="py-4 px-6 align-middle text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="edit-lesson p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-id="${
              l._id
            }">
              <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
            </button>
            <button class="delete-lesson p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-id="${
              l._id
            }">
              <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".edit-lesson").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;
        window.location.href = `/edit-lesson.html?id=${id}`;
      })
    );

    document.querySelectorAll(".delete-lesson").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;

        const confirmed = await createConfirmationPrompt("Delete this lesson? It can be restored later.");
        if (!confirmed) return;

        try {
          await putJSON(`/admin/lessons/${id}/delete`);
          await loadLessons();
        } catch (err) {
          console.error(err);
          alert(err.message || err.payload?.message || "Delete failed");
        }
      })
    );
  } catch (err) {
    console.error("Failed to load lessons", err);
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

function wireAddLesson() {
  const btn = document.querySelector("button.bg-primary");
  if (btn && btn.textContent.includes("+ Add Lesson")) {
    btn.addEventListener(
      "click",
      () => (window.location.href = "/add-new-lesson.html")
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadLessons();
  wireAddLesson();
});
