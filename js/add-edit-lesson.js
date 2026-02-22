import { getJSON, postJSON, putJSON, apiFetch, deleteJSON } from "./app.js";
// 🔹 AUTOSAVE
const LESSON_DRAFT_KEY = "lesson_draft_autosave";
let ORIGINAL_LESSON = null;

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function showLoading(message = "Processing...") {
  let modal = document.querySelector(".js-loading-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className =
      "js-loading-modal fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="bg-white dark:bg-[#0f1724] rounded-lg p-6 flex items-center gap-4 shadow-2xl transition-all duration-300 ease-in-out transform scale-95 opacity-0 -translate-y-4">
        <div class="loader w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
        <div class="text-base font-medium text-slate-700 dark:text-slate-200">${message}</div>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
      const inner = modal.querySelector("div");
      if (inner)
        inner.classList.remove("scale-95", "opacity-0", "-translate-y-4");
    }, 20);
  } else {
    modal.querySelector("div > div:last-child").textContent = message;
    modal.classList.remove("hidden");
    const inner = modal.querySelector("div");
    if (inner)
      inner.classList.remove("scale-95", "opacity-0", "-translate-y-4");
  }
}

function hideLoading() {
  const modal = document.querySelector(".js-loading-modal");
  if (!modal) return;
  const inner = modal.querySelector("div");

  if (inner) {
    inner.classList.add("scale-95", "opacity-0", "-translate-y-4");
    inner.addEventListener(
      "transitionend",
      () => {
        modal.classList.add("hidden");
      },
      { once: true },
    );
  } else {
    modal.classList.add("hidden");
  }
}

function renderDocs(list, lessonId) {
  const container = document.querySelector("#document-list");
  console.log("Document list container:", container);
  if (!container) return;
  // remove existing rendered rows
  const existing = container.querySelectorAll(".js-existing-doc");
  existing.forEach((n) => n.remove());

  // Update doc count if element exists
  const docCount = document.querySelector("#doc-count");
  if (docCount) {
    docCount.textContent = `${list.length} Attached`;
  }

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
        }" data-doc-id="${d._id}"/>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <div class="flex-1 sm:flex-none px-3 py-1.5 rounded bg-slate-200 dark:bg-[#232f48] text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px] border border-transparent dark:border-slate-700">${
          d.originalName || d.url || "file"
        }</div>
        <div class="flex gap-1">
          <button class="replace-doc p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors" title="Replace file" type="button"> <span class="material-symbols-outlined text-[20px]">file_upload</span></button>
          <button class="delete-doc p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Remove" type"button"> <span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
      </div>
    `;

    // delete
    el.querySelector(".delete-doc").addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const confirmed = await createConfirmationPrompt("Remove this document?");
      if (!confirmed) return;

      try {
        // Animate row background to red
        el.style.transition = "background-color 0.3s";
        el.style.backgroundColor = "#f87171"; // Tailwind red-400
        el.style.color = "#fff"; // Optional for contrast

        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 0.3s

        showLoading("Removing document...");
        await deleteJSON(`/admin/lessons/${lessonId}/docs/${d._id}`);
        hideLoading();
        showToast("Document removed", "success");
        loadLesson(lessonId);
      } catch (err) {
        hideLoading();
        console.error(err);
        showToast("Failed to remove document", "error");
      }
    });

    // replace file
    el.querySelector(".replace-doc").addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";
      input.addEventListener("change", async () => {
        if (!input.files || !input.files[0]) return;
        const labelInput = el.querySelector(".doc-label-input");
        const label = labelInput ? labelInput.value : "";
        try {
          const confirmed = await createConfirmationPrompt(
            "Replace this document with selected file?",
          );
          if (!confirmed) return;
          showLoading("Replacing document...");
          // delete old first
          await deleteJSON(`/admin/lessons/${lessonId}/docs/${d._id}`);
          // upload new file
          const fd = new FormData();
          fd.append("docs", input.files[0]);
          fd.append("labels", JSON.stringify([label]));
          await apiFetch(`/admin/lessons/${lessonId}/docs`, {
            method: "POST",
            body: fd,
          });
          hideLoading();
          showToast("Document replaced", "success");
          loadLesson(lessonId);
        } catch (err) {
          hideLoading();
          console.error(err);
          showToast("Failed to replace document", "error");
        }
      });
      input.click();
    });

    // update label on blur (debounced)
    const labelEl = el.querySelector(".doc-label-input");
    if (labelEl) {
      let t;
      labelEl.addEventListener("blur", () => {
        clearTimeout(t);
        t = setTimeout(async () => {
          try {
            await putJSON(`/admin/lessons/${lessonId}/docs/${d._id}`, {
              label: labelEl.value,
            });
          } catch (err) {
            console.error(err);
          }
        }, 700);
      });
    }

    container.appendChild(el);
  });
}

function createConfirmationPrompt(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4";

    const modalContent = document.createElement("div");
    modalContent.className =
      "bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-sm transition-all duration-300 ease-in-out transform scale-95 opacity-0 -translate-y-4";
    modalContent.innerHTML = `
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Confirm Action</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">${message}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-b-xl flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Confirm</button>
        </div>
    `;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0", "-translate-y-4");
    }, 20);

    const confirmBtn = modal.querySelector("#confirm-btn");
    const cancelBtn = modal.querySelector("#cancel-btn");

    const closeModal = (value) => {
      modalContent.classList.add("scale-95", "opacity-0", "-translate-y-4");
      modalContent.addEventListener(
        "transitionend",
        () => {
          document.body.removeChild(modal);
          resolve(value);
        },
        { once: true },
      );
    };

    confirmBtn.addEventListener("click", () => closeModal(true));
    cancelBtn.addEventListener("click", () => closeModal(false));
  });
}

// async function loadLesson(lessonId) {
//   try {
//     const res = await getJSON(`/admin/lessons/${lessonId}`);
//     const l = res.data;
//     const form = document.querySelector("form");
//     if (!form) return;
//     const textInputs = form.querySelectorAll('input[type="text"]');
//     if (textInputs[0]) textInputs[0].value = l.title || "";
//     if (textInputs[1]) textInputs[1].value = l.topic || "";
//     const sel = form.querySelector("select");
//     if (sel) sel.value = l.grade || "";
//     const urlInput = form.querySelector('input[type="url"]');
//     if (urlInput) urlInput.value = l.videoUrl || "";
//     renderDocs(l.docs || [], lessonId);
//   } catch (err) {
//     console.error(err);
//     if (err.status === 401) location.href = "/sign-in.html";
//     showToast("Failed to load lesson data", "error");
//   }
// }

async function loadLesson(lessonId) {
  try {
    const res = await getJSON(`/admin/lessons/${lessonId}`);
    const l = res.data;

    // 🔹 STORE ORIGINAL DATA
    ORIGINAL_LESSON = {
      title: l.title || "",
      topic: l.topic || "",
      grade: l.grade || "",
      video: l.videoUrl || "",
    };

    const form = document.querySelector("form");
    if (!form) return;

    const textInputs = form.querySelectorAll('input[type="text"]');
    if (textInputs[0]) textInputs[0].value = ORIGINAL_LESSON.title;
    if (textInputs[1]) textInputs[1].value = ORIGINAL_LESSON.topic;

    const sel = form.querySelector("select");
    if (sel) sel.value = ORIGINAL_LESSON.grade;

    const urlInput = form.querySelector('input[type="url"]');
    if (urlInput) urlInput.value = ORIGINAL_LESSON.video;

    renderDocs(l.docs || [], lessonId);
  } catch (err) {
    console.error(err);
    showToast("Failed to load lesson data", "error");
    window.location.href = "manage-lessons.html";
  }
}

function getChangedFields(current, original) {
  const changes = {};
  let hasChanges = false;

  Object.keys(current).forEach((key) => {
    if ((current[key] || "") !== (original[key] || "")) {
      changes[key] = current[key];
      hasChanges = true;
    }
  });

  return hasChanges ? changes : null;
}

async function createLesson(form) {
  try {
    showLoading("Creating lesson..."); // show initial loading

    await apiFetch("/admin/lessons", { method: "POST", body: form });

    // 🔹 Change modal content to success
    const modal = document.querySelector(".js-loading-modal");
    if (modal) {
      modal.querySelector("div > div").innerHTML = `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-green-500 text-3xl animate-bounce">check_circle</span>
          <span class="text-sm text-slate-700 dark:text-slate-200 font-semibold">Lesson Created!</span>
        </div>
      `;
      // Keep the message visible for 1.5s, then hide and redirect
      setTimeout(() => {
        hideLoading();
        sessionStorage.removeItem(LESSON_DRAFT_KEY);
        location.href = "manage-lessons.html";
      }, 1500);
    }
  } catch (err) {
    hideLoading();
    console.error(err);
    showToast("Lesson creation failed", "error");
  }
}

async function updateLesson(lessonId, body) {
  try {
    showLoading("Saving changes...");
    await putJSON(`/admin/lessons/${lessonId}`, body);
    hideLoading();
    showToast("Changes saved", "success");
    loadLesson(lessonId);
  } catch (err) {
    hideLoading();
    console.error(err);
    showToast("Save failed", "error");
  }
}

async function uploadDocs(lessonId, fd) {
  try {
    showLoading("Uploading files...");
    await apiFetch(`/admin/lessons/${lessonId}/docs`, {
      method: "POST",
      body: fd,
    });
    hideLoading();
    showToast("Files uploaded", "success");
    loadLesson(lessonId);
  } catch (err) {
    hideLoading();
    console.error(err);
    showToast("File upload failed", "error");
  }
}

function collectFormAsFormData() {
  const form = document.querySelector("form");
  const title = form.querySelector('input[type="text"]')?.value || "";
  const topic = form.querySelectorAll('input[type="text"]')[1]?.value || "";
  const grade = form.querySelector("select")?.value || "";
  const video = form.querySelector('input[type="url"]')?.value || "";

  const fd = new FormData();
  fd.append("title", title);
  fd.append("topic", topic);
  fd.append("grade", grade);
  fd.append("video", video);

  // collect file inputs
  form.querySelectorAll("input[type=file]").forEach((f, i) => {
    if (f.files && f.files[0]) fd.append("docs", f.files[0]);
  });

  // collect labels for files if available
  const labels = Array.from(form.querySelectorAll(".doc-label-input")).map(
    (i) => i.value,
  );
  if (labels.length) fd.append("labels", JSON.stringify(labels));

  return fd;
}

// 🔹 AUTOSAVE
function updateLastSaved(ts) {
  const el = document.querySelector("#last-saved");
  if (!el) return;

  const timeStr = new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  el.querySelector("span").textContent = timeStr;

  // Show and animate
  el.classList.remove("hidden", "opacity-0");
  el.classList.add("opacity-100", "transition-opacity", "duration-300");

  // Optionally fade out after 3s
  // setTimeout(() => {
  //   el.classList.remove("opacity-100");
  //   el.classList.add("opacity-0");
  // }, 3000);
}

function saveDraftToSession() {
  const form = document.querySelector("form");
  if (!form) return;

  const data = {
    title: form.querySelectorAll('input[type="text"]')[0]?.value || "",
    topic: form.querySelectorAll('input[type="text"]')[1]?.value || "",
    grade: form.querySelector("select")?.value || "",
    video: form.querySelector('input[type="url"]')?.value || "",
    docs: Array.from(form.querySelectorAll(".doc-label-input")).map(
      (i) => i.value,
    ),
    savedAt: Date.now(),
  };

  sessionStorage.setItem(LESSON_DRAFT_KEY, JSON.stringify(data));
  updateLastSaved(data.savedAt);
}

// 🔹 AUTOSAVE
function updateDraftDocCount(count) {
  const docCount = document.querySelector("#doc-count");
  if (docCount) {
    docCount.textContent = `${count} Attached`;
  }
}

function loadDraftFromSession() {
  const raw = sessionStorage.getItem(LESSON_DRAFT_KEY);
  if (!raw) return;

  const data = JSON.parse(raw);
  console.log("Draft data:", data);
  const form = document.querySelector("form");
  console.log("Form element:", form);
  if (!form) return;

  const textInputs = form.querySelectorAll('input[type="text"]');
  if (textInputs[0]) textInputs[0].value = data.title || "";
  if (textInputs[1]) textInputs[1].value = data.topic || "";

  const sel = form.querySelector("select");
  if (sel) sel.value = data.grade || "";

  const urlInput = form.querySelector('input[type="url"]');
  if (urlInput) urlInput.value = data.video || "";

  data.docs?.forEach((label) => {
    const addBtn = document.querySelector("#add-another-doc");
    console.log("Add button:", addBtn);
    if (!addBtn) return;

    addBtn.click();
    console.log("Setting label:", label);

    // 🔹 FIX: wait for row to exist
    const inputs = document.querySelectorAll(".doc-label-input");
    const last = inputs[inputs.length - 1];
    console.log("Last label input:", last);
    if (last) last.value = label;
    console.log("Label set:", label);
  });

  if (data.savedAt) updateLastSaved(data.savedAt);
  // 🔹 AUTOSAVE
  updateDraftDocCount(data.docs?.length || 0);
}

function wire() {
  const form = document.querySelector("form");
  if (!form) return;

  // Prevent form submission on Enter key
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // Allow Enter in textareas for new lines
      if (e.target.tagName.toLowerCase() === "textarea") {
        return;
      }
      e.preventDefault();
    }
  });

  // 🔹 AUTOSAVE
  let autosaveTimer;
  form.addEventListener("input", () => {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(saveDraftToSession, 500);
  });

  document.querySelector(".submit-btn-edit")?.addEventListener("click", (e) => {
    e.preventDefault();
    form.requestSubmit();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = getParam("id");
    const fd = collectFormAsFormData();
    if (id) {
      const current = {
        title: fd.get("title"),
        topic: fd.get("topic"),
        grade: fd.get("grade"),
        video: fd.get("video"),
      };

      const changes = getChangedFields(current, ORIGINAL_LESSON);

      if (id && !changes && !fd.getAll("docs").length) {
        showToast("No changes to save", "info");
        return;
      }

      if (changes) {
        await updateLesson(id, changes);
        ORIGINAL_LESSON = { ...ORIGINAL_LESSON, ...changes };
      }

      if (fd.getAll("docs").length) {
        await uploadDocs(id, fd);
      }
      console.log("No changes detected, but form submitted");
      showToast("All changes saved", "success");
    } else {
      await createLesson(fd);
    }
  });
  // Add Another Document button (find by label or id)
  const addBtn =
    document.querySelector("#add-another-doc") ||
    Array.from(form.querySelectorAll('button[type="button"]')).find((b) =>
      /add another document/i.test(b.textContent || ""),
    );
  if (addBtn) {
    addBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const row = document.createElement("div");
      if (getParam("id")) {
        //         row.className =
        //           "js-new-doc flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg " +
        //           "border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10";

        //         row.innerHTML = `
        //   <!-- Icon -->
        //   <div class="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
        //     <span class="material-symbols-outlined text-[24px]">description</span>
        //   </div>

        //   <!-- Label -->
        //   <div class="flex-1 flex flex-col gap-1 w-full min-w-0">
        //     <label class="text-[11px] text-slate-500 uppercase font-semibold">
        //       Document Label
        //     </label>
        //     <input
        //       class="doc-label-input bg-transparent border-none p-0 text-sm font-medium
        //              text-slate-900 dark:text-white focus:ring-0"
        //       placeholder="e.g. Algebra worksheet"
        //       type="text"
        //     />
        //   </div>

        //   <!-- File + Badge -->
        //   <div class="flex items-center gap-2 w-full sm:w-auto">
        //     <input
        //       type="file"
        //       class="text-xs text-slate-500 dark:text-slate-400"
        //     />
        //     <span class="px-2 py-0.5 text-[10px] rounded-full
        //                  bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
        //       New
        //     </span>
        //   </div>

        //   <!-- Remove -->
        //   <button
        //     type="button"
        //     class="remove-doc p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        //     title="Remove"
        //   >
        //     <span class="material-symbols-outlined text-[20px]">close</span>
        //   </button>
        // `;
        row.className =
          "js-existing-doc flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg border border-slate-200 dark:border-[#324467] bg-slate-50 dark:bg-[#192233]/50";

        row.innerHTML = `
  <div class="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
    <span class="material-symbols-outlined text-[24px]">description</span>
  </div>

  <div class="flex-1 flex flex-col gap-1 w-full min-w-0">
    <label class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
      Document Label
    </label>
    <input
      class="doc-label-input bg-transparent border-none p-0 text-sm font-medium text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400 w-full"
      placeholder="e.g. Algebra I Worksheet"
      type="text"
    />
  </div>

  <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
    <div
      class="flex-1 sm:flex-none px-3 py-1.5 rounded bg-slate-200 dark:bg-[#232f48]
             text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px]
             border border-transparent dark:border-slate-700 file-name"
    >
      No file attached
    </div>

    <div class="flex gap-1">
      <!-- Attach / Upload (NEW DOC meaning) -->
      <label
  class="replace-doc p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700
         text-slate-400 hover:text-primary transition-colors cursor-pointer"
  title="Upload file"
>
  <span class="material-symbols-outlined text-[20px]">upload_file</span>

  <input
    type="file"
    class="hidden doc-file-input"
  />
</label>

      <!-- Remove -->
      <button
        class="delete-doc p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
               text-slate-400 hover:text-red-500 transition-colors remove-doc"
        title="Remove"
      >
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  </div>
`;
      } else {
        row.className =
          "group flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-slate-50 dark:bg-[#151c2a] border border-slate-200 dark:border-slate-700/50";
        row.innerHTML = `
          <div class="flex-1 flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Label</span>
            <input class="doc-label-input w-full bg-white dark:bg-input-dark border-slate-200 dark:border-border-dark rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white" placeholder="e.g. Algebra I Worksheet" type="text" />
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upload File from Device</span>
            <input
              class="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
              type="file"
            />
          </div>
          <div class="flex items-end justify-end sm:pb-[1px]">
            <button class="size-9 remove-doc flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Remove Document" type="button" id="remove-doc-btn">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>`;
      }
      // try to find the docs list container
      const docsList =
        form.querySelector(".flex.flex-col.gap-4") || addBtn.parentElement;
      docsList.insertBefore(row, addBtn);
      if (getParam("id")) {
        row
          .querySelector(".doc-file-input")
          .addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const nameBox = row.querySelector(".file-name");
            nameBox.textContent = file.name;

            const lessonId = getParam("id");
            if (!lessonId) return;

            const fd = new FormData();
            fd.append("docs", file);

            // Optionally: include the label if any
            const labelInput = row.querySelector(".doc-label-input");
            if (labelInput)
              fd.append("labels", JSON.stringify([labelInput.value]));

            try {
              showLoading("Uploading document...");
              await apiFetch(`/admin/lessons/${lessonId}/docs`, {
                method: "POST",
                body: fd,
              });
              hideLoading();
              showToast("Document uploaded successfully", "success");
              docsList.removeChild(row); // remove the upload row
              loadLesson(lessonId); // reload docs list
            } catch (err) {
              hideLoading();
              console.error(err);
              showToast("Document upload failed", "error");
            }
          });
      }
      // 🔹 AUTOSAVE: update attached count
      updateDraftDocCount(document.querySelectorAll(".doc-label-input").length);
      row.querySelector(".remove-doc").addEventListener("click", (el) => {
        row.remove();
        // 🔹 AUTOSAVE
        const raw = sessionStorage.getItem(LESSON_DRAFT_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          const input = row.querySelector(".doc-label-input");
          if (input) {
            // remove the label value from the docs array
            data.docs = data.docs.filter((lbl) => lbl !== input.value);
            data.savedAt = Date.now();
            sessionStorage.setItem(LESSON_DRAFT_KEY, JSON.stringify(data));
            updateLastSaved(data.savedAt);
          }
        }

        // 🔹 AUTOSAVE: update attached count
        updateDraftDocCount(
          document.querySelectorAll(".doc-label-input").length,
        );
      });
    });
  }

  // Cancel buttons -> back to manage
  Array.from(form.querySelectorAll('button[type="button"]')).forEach((b) => {
    if (/cancel/i.test(b.textContent || "")) {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        location.href = "/manage-lessons.html";
      });
    }
  });

  window.addEventListener("beforeunload", () => {
    const lessonId = getParam("id");
    if (!lessonId || !ORIGINAL_LESSON) return;

    const form = document.querySelector("form");
    if (!form) return;

    const current = {
      title: form.querySelectorAll('input[type="text"]')[0]?.value || "",
      topic: form.querySelectorAll('input[type="text"]')[1]?.value || "",
      grade: form.querySelector("select")?.value || "",
      video: form.querySelector('input[type="url"]')?.value || "",
    };

    const changes = getChangedFields(current, ORIGINAL_LESSON);
    if (!changes) return;

    putJSON(`/admin/lessons/${lessonId}`, changes).catch((err) => {
      console.error(err);
      showToast("Save failed", "error");
    });
  });

  document.querySelector(".dl-btn").addEventListener("click", async () => {
    const lessonId = getParam("id");
    if (!lessonId) return;

    try {
      const confirmed = await createConfirmationPrompt(
        "Delete this lesson? It can be restored later.",
      );
      if (!confirmed) return;
      showLoading("Deleting lesson...");
      await putJSON(`/admin/lessons/${lessonId}/delete`);
      hideLoading();
      showToast("Lesson deleted successfully", "success");
      location.href = "/manage-lessons.html";
    } catch (err) {
      hideLoading();
      showToast("Failed to delete lesson", "error");
    }
  });
}

function showToast(message, type = "success", duration = 3000) {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container fixed top-4 right-4 left-4 sm:left-auto sm:right-5 z-[100] flex flex-col gap-3 w-auto sm:w-80";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  const icon = type === "success" ? "check_circle" : "cancel";
  const iconColor = type === "success" ? "text-green-400" : "text-red-400";

  toast.className = `
    flex items-center gap-3 p-4 rounded-xl shadow-lg w-full
    bg-white dark:bg-[#1e293b] border border-slate-200/50 dark:border-slate-700/50
    transform transition-all duration-300 ease-in-out opacity-0 translate-y-2 sm:translate-x-10
  `;
  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-2xl">${icon}</span>
    <p class="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">${message}</p>
    <button class="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 close-toast">
      <span class="material-symbols-outlined text-base">close</span>
    </button>
  `;

  toastContainer.prepend(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-2", "sm:translate-x-10");
  }, 20);

  const closeToast = () => {
    toast.classList.add(
      "opacity-0",
      "translate-y-2",
      "sm:translate-x-10",
      "h-0",
      "p-0",
      "border-0",
    );
    const onTransitionEnd = () => {
      toast.removeEventListener("transitionend", onTransitionEnd);
      toast.remove();
      if (toastContainer && !toastContainer.hasChildNodes()) {
        toastContainer.remove();
      }
    };
    toast.addEventListener("transitionend", onTransitionEnd);
  };

  const closeBtn = toast.querySelector(".close-toast");
  if (closeBtn) closeBtn.addEventListener("click", closeToast, { once: true });

  setTimeout(closeToast, duration);
}

document.addEventListener("DOMContentLoaded", () => {
  wire();

  const id = getParam("id");
  if (id) {
    loadLesson(id);
  } else {
    // 🔹 AUTOSAVE
    loadDraftFromSession();
    console.log("Loaded draft from session");
  }
});
