import { getJSON, putJSON, apiFetch, deleteJSON } from "./app.js";

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

const dirtyQuestions = new Set();
let pendingSaves = 0;
let ORIGINAL_QUIZ = null;
const ORIGINAL_QUESTIONS = new Map();

function setSaveStatus(message) {
  const el = document.getElementById("quiz-save-status");
  if (el) el.textContent = message;
}

function updateLastSaved(ts = Date.now()) {
  const el = document.getElementById("quiz-last-saved");
  if (!el) return;
  const timeStr = new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  el.textContent = `Last saved: ${timeStr}`;
}

function bumpSaving() {
  pendingSaves += 1;
  setSaveStatus("Saving changes...");
}

function bumpSaved() {
  pendingSaves = Math.max(0, pendingSaves - 1);
  if (pendingSaves === 0) {
    setSaveStatus("All changes saved");
    updateLastSaved();
  }
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

function mkOption(value, selectedText) {
  return `<option value="${value}" ${
    selectedText ? "selected" : ""
  }>${value}</option>`;
}

function formatUpdatedAt(value) {
  if (!value) return "Last modified: --";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Last modified: --";
  return `Last modified: ${date.toLocaleString()}`;
}

function answerToIndex(answer) {
  if (answer === undefined || answer === null || answer === "") return 0;
  if (typeof answer === "number" && Number.isFinite(answer)) return answer;
  if (typeof answer === "string") {
    const trimmed = answer.trim();
    if (/^[A-Da-d]$/.test(trimmed))
      return trimmed.toUpperCase().charCodeAt(0) - 65;
    if (/^[0-9]+$/.test(trimmed)) return Number(trimmed);
  }
  return 0;
}

function indexToLetter(index) {
  const letters = ["A", "B", "C", "D"];
  if (Number.isFinite(index) && index >= 0 && index < letters.length)
    return letters[index];
  return "A";
}

function clearNewImagePreview() {
  const preview = document.getElementById("new-image-preview");
  const empty = document.getElementById("new-image-empty");
  if (preview) {
    preview.src = "";
    preview.classList.add("hidden");
  }
  if (empty) empty.classList.remove("hidden");
}

function setNewQuestionTypeUI(type) {
  const textWrapper = document.getElementById("new-text-wrapper");
  const imageWrapper = document.getElementById("new-image-wrapper");
  const imageInput = document.getElementById("new-image");
  const questionInput = document.getElementById("new-question-text");
  const optionsHelp = document.getElementById("new-options-help");
  const optionInputs = document.querySelectorAll(".new-option-input");
  const fixedMap = [
    document.getElementById("opt-a-fixed"),
    document.getElementById("opt-b-fixed"),
    document.getElementById("opt-c-fixed"),
    document.getElementById("opt-d-fixed"),
  ];

  if (type === "image") {
    if (textWrapper) textWrapper.classList.add("hidden");
    if (imageWrapper) imageWrapper.classList.remove("hidden");
    if (questionInput) questionInput.value = "";
    if (optionsHelp) optionsHelp.textContent = "Options are fixed (A-D)";
    optionInputs.forEach((el) => el.classList.add("hidden"));
    fixedMap.forEach((el) => el && el.classList.remove("hidden"));
  } else {
    if (textWrapper) textWrapper.classList.remove("hidden");
    if (imageWrapper) imageWrapper.classList.add("hidden");
    if (imageInput) imageInput.value = "";
    clearNewImagePreview();
    if (optionsHelp) optionsHelp.textContent = "Options are editable (Text Question)";
    optionInputs.forEach((el) => el.classList.remove("hidden"));
    fixedMap.forEach((el) => el && el.classList.add("hidden"));
  }
}

async function loadQuiz() {
  const id = getParam("id");
  if (!id) return (location.href = "/manage-quizzes.html");

  try {
    showLoading("Loading quiz...");
    const res = await getJSON(`/admin/quizzes/edit/${id}`);
    hideLoading();
    const q = res.data;
    const titleInput = document.getElementById("quiz-title");
    if (titleInput) titleInput.value = q.title || "";
    const headerTitle = document.getElementById("quiz-title-header");
    if (headerTitle) headerTitle.textContent = `Edit Quiz: ${q.title || ""}`;
    const headerModified = document.getElementById("quiz-last-modified");
    if (headerModified)
      headerModified.textContent = formatUpdatedAt(q.updatedAt);
    const gradeSelect = document.getElementById("quiz-grade");
    if (gradeSelect) {
      const grades = ["5", "6", "7", "8", "9"];
      gradeSelect.innerHTML = grades
        .map(
          (val) =>
            `<option value='${val}' ${
              val === q.grade ? "selected" : ""
            }>Grade ${val}</option>`,
        )
        .join("");
    }

    ORIGINAL_QUIZ = {
      title: q.title || "",
      grade: q.grade || "",
    };
    ORIGINAL_QUESTIONS.clear();
    (q.questions || []).forEach((qq) => {
      ORIGINAL_QUESTIONS.set(qq._id, {
        question: qq.question || "",
        options: Array.isArray(qq.options) ? qq.options.slice(0, 4) : ["", "", "", ""],
        answer: indexToLetter(answerToIndex(qq.answer)),
        isImage: Boolean(qq.image?.url),
      });
    });
    renderExistingQuestions(q.questions || [], id);
    setSaveStatus("All changes saved");
    updateLastSaved(Date.now());
  } catch (err) {
    hideLoading();
    console.error(err);
    if (err.status === 401) location.href = "/sign-in.html";
    showToast(err.message || err.payload?.message || "Failed to load quiz", "error");
  }
}

function renderExistingQuestions(questions, quizId) {
  const container = document.getElementById("existing-questions");
  if (!container) return;
  container.innerHTML = "";

  const count = document.getElementById("question-count");
  if (count) count.textContent = `Questions (${questions.length})`;

  if (questions.length === 0) {
    container.innerHTML = `
      <div class="rounded-xl bg-white dark:bg-[#1c2536] border border-dashed border-slate-200 dark:border-[#232f48] p-8 text-center">
        <p class="text-slate-500 dark:text-[#92a4c9] text-sm">No questions yet. Use the form below to add your first question.</p>
      </div>
    `;
    return;
  }

  questions.forEach((qq, idx) => {
    const div = document.createElement("div");
    div.className =
      "rounded-xl bg-white dark:bg-[#1c2536] border border-primary/50 shadow-[0_0_15px_rgba(19,91,236,0.1)] overflow-hidden";
    div.dataset.qid = qq._id;

    const optionLabels = ["A", "B", "C", "D"];
    const correctIndex = answerToIndex(qq.answer);
    const correctLetter = indexToLetter(correctIndex);
    const options = Array.isArray(qq.options) ? qq.options : [];
    const isImageQuestion = Boolean(qq.image?.url);
    const optionsHtml = optionLabels
      .map((label, i) => {
        const isActive = i === correctIndex;
        const activeClass = isActive
          ? "border-primary ring-2 ring-primary/30"
          : "border-slate-200 dark:border-[#232f48]";
        const textClass = isActive
          ? "text-primary"
          : "text-slate-500 dark:text-[#586b8f]";
        const value = options[i] || "";
        return `
          <button data-answer="${label}" class="answer-option w-full text-left flex items-center gap-3 bg-slate-50 dark:bg-[#111722] p-3 rounded-lg border ${activeClass} transition-colors">
            <div class="flex-1">
              <span class="${textClass} text-xs font-bold mb-1 block">Option ${label}</span>
              ${
                isImageQuestion
                  ? `<div class="text-slate-900 dark:text-white font-medium">${label}</div>`
                  : `<input
                      class="opt-input w-full bg-transparent border-none text-slate-900 dark:text-white p-0 focus:ring-0 placeholder-slate-400 dark:placeholder-[#34425e] font-medium"
                      type="text"
                      value="${value}"
                    />`
              }
            </div>
            ${
              isActive
                ? `<span class="material-symbols-outlined text-primary text-sm">check_circle</span>`
                : ""
            }
          </button>
        `;
      })
      .join("");

    const imagePreview = qq.image?.url
      ? `<img src="${qq.image.url}" alt="Question image" class="w-full h-64 md:h-72 rounded-xl object-contain border border-slate-200 dark:border-[#232f48] bg-white dark:bg-[#0f1724]" />`
      : `<div class="size-16 bg-slate-200 dark:bg-[#232f48] rounded flex items-center justify-center text-slate-400 dark:text-[#92a4c9]">
          <span class="material-symbols-outlined">image</span>
        </div>`;

    div.innerHTML = `
      <div class="bg-slate-50 dark:bg-[#232f48] px-6 py-3 flex justify-between items-center border-b border-slate-200 dark:border-[#232f48]">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-slate-400 dark:text-[#92a4c9] cursor-move">drag_indicator</span>
          <span class="text-slate-900 dark:text-white font-bold">Question ${
            idx + 1
          }</span>
          <span class="bg-primary/10 dark:bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-medium">${
            isImageQuestion ? "Image Question" : "Text Question"
          }</span>
        </div>
        <div class="flex gap-2">
          <button data-qid="${
            qq._id
          }" class="update-q-btn text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-200 dark:hover:bg-[#34425e] transition-colors">
            <span class="material-symbols-outlined text-[20px]">save</span>
          </button>
          <button data-qid="${
            qq._id
          }" class="delete-q-btn text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>
      <div class="p-6 flex flex-col gap-6">
        ${
          isImageQuestion
            ? ""
            : `<div>
                <label class="block text-slate-500 dark:text-[#92a4c9] text-xs uppercase font-bold tracking-wider mb-2">Question Text</label>
                <textarea class="question-text w-full bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-[#232f48] rounded-lg text-slate-900 dark:text-white px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 dark:placeholder-[#586b8f] font-mono text-sm leading-relaxed" rows="3">${
                  qq.question || ""
                }</textarea>
              </div>`
        }
        ${
          isImageQuestion
            ? `<div class="rounded-lg bg-slate-50 dark:bg-[#111722] border border-dashed border-slate-300 dark:border-[#232f48] p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-slate-900 dark:text-white text-sm font-medium">Question Image</p>
                    <p class="text-slate-500 dark:text-[#92a4c9] text-xs">Replace the image for this question.</p>
                  </div>
                  <label class="text-primary text-xs font-bold hover:underline cursor-pointer">
                    Replace Image
                    <input type="file" class="image-input hidden" />
                  </label>
                </div>
                ${imagePreview}
              </div>`
            : ""
        }
        <div>
          <div class="flex justify-between items-center mb-3">
            <label class="block text-slate-500 dark:text-[#92a4c9] text-xs uppercase font-bold tracking-wider">Answer Options</label>
            <span class="text-slate-500 dark:text-[#92a4c9] text-xs">${isImageQuestion ? "Options are fixed (A-D)" : "Click an option to mark correct"}</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${optionsHtml}
          </div>
        </div>
      </div>
    `;

    div.dataset.correct = correctLetter;

    div.querySelectorAll(".answer-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const selected = btn.dataset.answer || "A";
        div.dataset.correct = selected;
        div.querySelectorAll(".answer-option").forEach((b) => {
          b.classList.remove("border-primary", "ring-2", "ring-primary/30");
          b.classList.add("border-slate-200");
          const tick = b.querySelector(".material-symbols-outlined");
          if (tick) tick.remove();
          const label = b.querySelector("span.text-primary");
          if (label) label.classList.remove("text-primary");
        });
        btn.classList.add("border-primary", "ring-2", "ring-primary/30");
        const label = btn.querySelector("span");
        if (label) label.classList.add("text-primary");
        if (!btn.querySelector(".material-symbols-outlined")) {
          btn.insertAdjacentHTML(
            "beforeend",
            `<span class="material-symbols-outlined text-primary text-sm">check_circle</span>`,
          );
        }
        dirtyQuestions.add(div.dataset.qid);
        setSaveStatus("Unsaved changes");
      });
    });

    const imageInput = div.querySelector(".image-input");
    if (imageInput) {
      imageInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        const img = div.querySelector("img");
        if (!img || !file) return;
        const url = URL.createObjectURL(file);
        img.src = url;
        uploadImageWithLoading(div, quizId, file);
      });
    }

    const qText = div.querySelector(".question-text");
    if (qText) {
      qText.addEventListener("blur", () =>
        saveQuestionFromDiv(div, quizId, isImageQuestion),
      );
    }
    div.querySelectorAll(".opt-input").forEach((input) => {
      input.addEventListener("blur", () =>
        saveQuestionFromDiv(div, quizId, isImageQuestion),
      );
    });

    // update button
    div.querySelectorAll(".update-q-btn").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const qid = btn.dataset.qid;
        const question = isImageQuestion
          ? ""
          : div.querySelector(".question-text")?.value || "";
        const optionEls = div.querySelectorAll(".opt-input");
        const options = isImageQuestion
          ? ["A", "B", "C", "D"]
          : Array.from(optionEls).map((el) => el.value);
        const answer = div.dataset.correct || "A";
        const file = div.querySelector(".image-input")?.files?.[0];

        try {
          showLoading("Updating question...");
          if (file) {
            await saveQuestionJson(quizId, qid, question, options, answer);
            await uploadQuestionImage(quizId, qid, file);
          } else {
            await saveQuestionJson(quizId, qid, question, options, answer);
          }
          hideLoading();
          showToast("Question updated", "success");
          loadQuiz();
        } catch (err) {
          hideLoading();
          console.error(err);
          showToast(err.message || err.payload?.message || "Update failed", "error");
        }
      }),
    );

    // delete button
    div.querySelectorAll(".delete-q-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const confirmed = await createConfirmationPrompt(
          "Delete this question?",
        );
        if (!confirmed) return;
        try {
          showLoading("Deleting question...");
          await deleteJSON(
            `/admin/quizzes/${quizId}/questions/${btn.dataset.qid}`,
          );
          hideLoading();
          showToast("Deleted", "success");
          loadQuiz();
        } catch (err) {
          hideLoading();
          console.error(err);
          showToast("Delete failed", "error");
        }
      }),
    );

    container.appendChild(div);
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

async function addQuestion() {
  const quizId = getParam("id");
  if (!quizId) return;
  const type = document.getElementById("new-question-type")?.value || "text";
  const qText = document.getElementById("new-question-text")?.value || "";
  const options =
    type === "image"
      ? ["A", "B", "C", "D"]
      : [
          document.getElementById("opt-a")?.value || "",
          document.getElementById("opt-b")?.value || "",
          document.getElementById("opt-c")?.value || "",
          document.getElementById("opt-d")?.value || "",
        ];
  const answer = document.getElementById("new-answer-select")?.value || "A";
  const image = document.getElementById("new-image")?.files?.[0];
  const questionText = type === "text" ? qText : "";

  if (type === "text" && !qText.trim()) {
    showToast("Text questions must include question text.", "error");
    return;
  }
  if (type === "text" && options.some((o) => !o.trim())) {
    showToast("Text questions must include all four options.", "error");
    return;
  }
  if (type === "image" && !image) {
    showToast("Image questions must include an image.", "error");
    return;
  }

  const questions = [{ question: questionText, options, answer }];

  const fd = new FormData();
  fd.append("questions", JSON.stringify(questions));
  if (image) fd.append("image0", image);

  try {
    showLoading("Adding question...");
    await apiFetch(`/admin/quizzes/${quizId}/questions/add`, {
      method: "PUT",
      body: fd,
    });
    hideLoading();
    showToast("Question added", "success");
    // clear inputs
    document.getElementById("new-question-text").value = "";
    const answerSelect = document.getElementById("new-answer-select");
    if (answerSelect) answerSelect.value = "A";
    document.querySelectorAll(".new-answer-option").forEach((b) => {
      b.classList.remove("border-primary", "ring-2", "ring-primary/30");
      b.classList.add("border-slate-200");
      const label = b.querySelector("span.text-primary");
      if (label) label.classList.remove("text-primary");
      const tick = b.querySelector(".material-symbols-outlined");
      if (tick) tick.remove();
    });
    const firstBtn = document.querySelector(".new-answer-option[data-answer='A']");
    if (firstBtn) {
      firstBtn.classList.add("border-primary", "ring-2", "ring-primary/30");
      const label = firstBtn.querySelector("span");
      if (label) label.classList.add("text-primary");
      firstBtn.insertAdjacentHTML(
        "beforeend",
        `<span class="material-symbols-outlined text-primary text-sm">check_circle</span>`,
      );
    }
    const typeSelect = document.getElementById("new-question-type");
    if (typeSelect) typeSelect.value = "text";
    ["opt-a", "opt-b", "opt-c", "opt-d"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });
    const imageInput = document.getElementById("new-image");
    if (imageInput) imageInput.value = "";
    clearNewImagePreview();
    setNewQuestionTypeUI("text");
    loadQuiz();
  } catch (err) {
    hideLoading();
    console.error(err);
    showToast(err.message || err.payload?.message || "Add failed", "error");
  }
}

async function saveMeta() {
  const quizId = getParam("id");
  const title = document.getElementById("quiz-title")?.value;
  const grade = document.getElementById("quiz-grade")?.value;
  try {
    showLoading("Saving quiz...");
    await putJSON(`/admin/quizzes/${quizId}`, { title, grade });
    hideLoading();
    showToast("Saved", "success");
    loadQuiz();
  } catch (err) {
    hideLoading();
    console.error(err);
    showToast(err.message || err.payload?.message || "Save failed", "error");
  }
}

async function saveMetaAutosave() {
  const quizId = getParam("id");
  if (!quizId) return;
  const title = document.getElementById("quiz-title")?.value;
  const grade = document.getElementById("quiz-grade")?.value;
  if (
    ORIGINAL_QUIZ &&
    (title || "") === (ORIGINAL_QUIZ.title || "") &&
    (grade || "") === (ORIGINAL_QUIZ.grade || "")
  ) {
    return;
  }
  try {
    bumpSaving();
    await putJSON(`/admin/quizzes/${quizId}`, { title, grade });
    ORIGINAL_QUIZ = { title: title || "", grade: grade || "" };
  } catch (err) {
    console.error(err);
  } finally {
    bumpSaved();
  }
}

async function saveQuestionFromDiv(div, quizId, isImageQuestion) {
  const qid = div.dataset.qid;
  if (!qid) return;
  const question = isImageQuestion
    ? ""
    : div.querySelector(".question-text")?.value || "";
  const optionEls = div.querySelectorAll(".opt-input");
  const options = isImageQuestion
    ? ["A", "B", "C", "D"]
    : Array.from(optionEls).map((el) => el.value);
  const answer = div.dataset.correct || "A";
  const original = ORIGINAL_QUESTIONS.get(qid);
  if (
    original &&
    (original.question || "") === (question || "") &&
    original.answer === answer &&
    original.options.join("||") === options.join("||")
  ) {
    return;
  }
  try {
    bumpSaving();
    showLoading("Saving changes...");
    await saveQuestionJson(quizId, qid, question, options, answer);
    ORIGINAL_QUESTIONS.set(qid, {
      question,
      options: options.slice(0, 4),
      answer,
      isImage: isImageQuestion,
    });
  } catch (err) {
    console.error(err);
    showToast("Save failed", "error");
  } finally {
    hideLoading();
    bumpSaved();
  }
}

async function saveQuestionJson(quizId, qid, question, options, answer) {
  await putJSON(`/admin/quizzes/${quizId}/questions/${qid}`, {
    question,
    options,
    answer,
  });
}

async function uploadQuestionImage(quizId, qid, file) {
  const fd = new FormData();
  fd.append("image0", file);
  await apiFetch(`/admin/quizzes/${quizId}/questions/${qid}`, {
    method: "PUT",
    body: fd,
  });
}

function uploadImageWithLoading(div, quizId, file) {
  const qid = div.dataset.qid;
  if (!qid || !file) return;
  showLoading("Replacing image...");
  bumpSaving();
  uploadQuestionImage(quizId, qid, file)
    .then(() => showToast("Image replaced", "success"))
    .catch((err) => {
      console.error(err);
      showToast("Image upload failed", "error");
    })
    .finally(() => {
      hideLoading();
      bumpSaved();
    });
}

async function saveAllChanges() {
  setSaveStatus("Saving changes...");
  await saveMetaAutosave();
  const quizId = getParam("id");
  if (!quizId) return;
  const questionDivs = document.querySelectorAll("#existing-questions > div");
  for (const div of questionDivs) {
    const qid = div.dataset.qid;
    if (!qid || !dirtyQuestions.has(qid)) continue;
    const isImageQuestion = Boolean(div.querySelector(".image-input"));
    await saveQuestionFromDiv(div, quizId, isImageQuestion);
    dirtyQuestions.delete(qid);
  }
  setSaveStatus("All changes saved");
  updateLastSaved();
  showToast("All changes saved", "success");
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

function flushPendingSaves() {
  const quizId = getParam("id");
  if (!quizId) return;
  const title = document.getElementById("quiz-title")?.value;
  const grade = document.getElementById("quiz-grade")?.value;
  if (title || grade) {
    putJSON(`/admin/quizzes/${quizId}`, { title, grade }).catch(() => {});
  }
  const questionDivs = document.querySelectorAll("#existing-questions > div");
  questionDivs.forEach((div) => {
    const qid = div.dataset.qid;
    if (!qid || !dirtyQuestions.has(qid)) return;
    const isImageQuestion = Boolean(div.querySelector(".image-input"));
    const question = isImageQuestion
      ? ""
      : div.querySelector(".question-text")?.value || "";
    const optionEls = div.querySelectorAll(".opt-input");
    const options = isImageQuestion
      ? ["A", "B", "C", "D"]
      : Array.from(optionEls).map((el) => el.value);
    const answer = div.dataset.correct || "A";
    putJSON(`/admin/quizzes/${quizId}/questions/${qid}`, {
      question,
      options,
      answer,
    }).catch(() => {});
  });
}

function wire() {
  document
    .getElementById("add-question-btn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      addQuestion();
    });
  document.querySelectorAll(".new-answer-option").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const selected = btn.dataset.answer || "A";
      const hidden = document.getElementById("new-answer-select");
      if (hidden) hidden.value = selected;
      document.querySelectorAll(".new-answer-option").forEach((b) => {
        b.classList.remove("border-primary", "ring-2", "ring-primary/30");
        b.classList.add("border-slate-200");
        const label = b.querySelector("span.text-primary");
        if (label) label.classList.remove("text-primary");
        const tick = b.querySelector(".material-symbols-outlined");
        if (tick) tick.remove();
      });
      btn.classList.add("border-primary", "ring-2", "ring-primary/30");
      const label = btn.querySelector("span");
      if (label) label.classList.add("text-primary");
      btn.insertAdjacentHTML(
        "beforeend",
        `<span class="material-symbols-outlined text-primary text-sm">check_circle</span>`,
      );
    });
  });
  document
    .getElementById("new-question-type")
    ?.addEventListener("change", (e) => {
      const type = e.target.value;
      setNewQuestionTypeUI(type);
    });
  document.getElementById("new-image-trigger")?.addEventListener("click", () => {
    document.getElementById("new-image")?.click();
  });
  document.getElementById("new-image-empty")?.addEventListener("click", () => {
    document.getElementById("new-image")?.click();
  });
  document
    .getElementById("new-image")
    ?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      const preview = document.getElementById("new-image-preview");
      const empty = document.getElementById("new-image-empty");
      if (!preview || !empty) return;
      if (!file) {
        clearNewImagePreview();
        return;
      }
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.classList.remove("hidden");
      empty.classList.add("hidden");
    });
  document.getElementById("quiz-title")?.addEventListener("blur", () => {
    saveMetaAutosave();
  });
  document.getElementById("quiz-grade")?.addEventListener("blur", () => {
    saveMetaAutosave();
  });
  document
    .getElementById("save-quiz-changes")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      saveAllChanges();
    });
  document
    .getElementById("delete-quiz-btn")
    ?.addEventListener("click", async (e) => {
      e.preventDefault();
      const quizId = getParam("id");
      if (!quizId) return;
      const confirmed = await createConfirmationPrompt(
        "Delete this quiz? This action can be restored later.",
      );
      if (!confirmed) return;
      try {
        showLoading("Deleting quiz...");
        await putJSON(`/admin/quizzes/${quizId}/delete`);
        hideLoading();
        showToast("Quiz deleted", "success");
        location.href = "/manage-quizzes.html";
      } catch (err) {
        hideLoading();
        console.error(err);
        showToast("Delete failed", "error");
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuiz();
  const initialType =
    document.getElementById("new-question-type")?.value || "text";
  setNewQuestionTypeUI(initialType);
  wire();
  window.addEventListener("beforeunload", () => {
    flushPendingSaves();
  });
});
