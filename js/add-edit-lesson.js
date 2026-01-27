import { getJSON, postJSON, putJSON, apiFetch, deleteJSON } from "./app.js";

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function renderDocs(list, lessonId) {
  const container = document.querySelector(
    ".flex.flex-col.sm:flex-row.gap-3.items-start"
  ); // heuristically find docs area
  if (!container) return;
  // remove existing rendered rows
  container.querySelectorAll(".js-existing-doc").forEach((n) => n.remove());

  list.forEach((d) => {
    const el = document.createElement("div");
    el.className =
      "js-existing-doc flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg border border-slate-200 dark:border-[#324467] bg-slate-50 dark:bg-[#192233]/50";
    el.innerHTML = `
      <div class="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
        <span class="material-symbols-outlined text-[24px]">description</span>
      </div>
      <div class="flex-1 flex flex-col gap-1 w-full min-w-0">
        <label class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Document Label</label>
        <input class="doc-label-input bg-transparent border-none p-0 text-sm font-medium text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400 w-full" value="${
          d.label || ""
        }" />
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <div class="flex-1 sm:flex-none px-3 py-1.5 rounded bg-slate-200 dark:bg-[#232f48] text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px] border border-transparent dark:border-slate-700">${
          d.originalName || d.url || "file"
        }</div>
        <div class="flex gap-1">
          <button class="replace-doc p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors" title="Replace file"> <span class="material-symbols-outlined text-[20px]">file_upload</span></button>
          <button class="delete-doc p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Remove"> <span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
      </div>
    `;

    el.querySelector(".delete-doc").addEventListener("click", async () => {
      const confirmed = await createConfirmationPrompt("Remove this document?");
      if (!confirmed) return;
      try {
        await deleteJSON(`/admin/lessons/${lessonId}/docs/${d._id}`);
        alert("Removed");
        loadLesson(lessonId);
      } catch (err) {
        console.error(err);
        alert("Remove failed");
      }
    });

    container.appendChild(el);
  });
}

function createConfirmationPrompt(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50";
    modal.innerHTML = `
      <div class="bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-6">
          <h3 class="text-lg font-bold">Confirm Action</h3>
          <p class="text-sm text-slate-500 mt-2">${message}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Confirm</button>
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

async function loadLesson(lessonId) {
  try {
    const res = await getJSON(`/admin/lessons/${lessonId}`);
    const l = res.data;
    document.querySelector(
      'input[placeholder="e.g. Introduction to Calculus"]'
    ).value = l.title || "";
    document.querySelector(
      'input[placeholder="e.g. Limits and Continuity"]'
    ).value = l.topic || "";
    document.querySelector("select").value = l.grade || "";
    document.querySelector('input[type="url"]').value = l.video || "";
    renderDocs(l.docs || [], lessonId);
  } catch (err) {
    console.error(err);
    if (err.status === 401) location.href = "/sign-in.html";
    alert("Failed to load lesson");
  }
}

async function createLesson(form) {
  try {
    await apiFetch("/admin/lessons", { method: "POST", body: form });
    alert("Lesson created");
    location.href = "/manage-lessons.html";
  } catch (err) {
    console.error(err);
    alert(err.message || err.payload?.message || "Create failed");
  }
}

async function updateLesson(lessonId, body) {
  try {
    await putJSON(`/admin/lessons/${lessonId}`, body);
    alert("Lesson updated");
    loadLesson(lessonId);
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
}

async function uploadDocs(lessonId, fd) {
  try {
    await apiFetch(`/admin/lessons/${lessonId}/docs`, {
      method: "POST",
      body: fd,
    });
    alert("Docs uploaded");
    loadLesson(lessonId);
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
}

function collectFormAsFormData() {
  const title = document.querySelector(
    'input[placeholder="e.g. Introduction to Calculus"]'
  ).value;
  const topic = document.querySelector(
    'input[placeholder="e.g. Limits and Continuity"]'
  ).value;
  const grade = document.querySelector("select").value;
  const video = document.querySelector('input[type="url"]').value;

  const fd = new FormData();
  fd.append("title", title);
  fd.append("topic", topic);
  fd.append("grade", grade);
  fd.append("video", video);

  // collect file inputs
  document.querySelectorAll("input[type=file]").forEach((f, i) => {
    if (f.files && f.files[0]) fd.append("docs", f.files[0]);
  });

  // collect labels for files if available
  const labels = Array.from(document.querySelectorAll(".doc-label-input")).map(
    (i) => i.value
  );
  if (labels.length) fd.append("labels", JSON.stringify(labels));

  return fd;
}

function wire() {
  const form = document.querySelector("form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = getParam("id");
    const fd = collectFormAsFormData();
    if (id) {
      // update metadata first
      await updateLesson(id, {
        title: fd.get("title"),
        topic: fd.get("topic"),
        grade: fd.get("grade"),
        video: fd.get("video"),
      });
      // if there are files, upload them
      if (fd.getAll("docs").length) await uploadDocs(id, fd);
    } else {
      await createLesson(fd);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getParam("id");
  if (id) loadLesson(id);
  wire();
});
