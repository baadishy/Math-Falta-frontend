import { apiFetch } from "./app.js";

const STORAGE_KEY = "quiz_draft_data";

// ==================== Modal Functions ====================
function showModal(title, message, buttons = []) {
  const existing = document.querySelector(".js-modal-overlay");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className =
    "js-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm";
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  let buttonsHTML = "";
  if (buttons.length > 0) {
    buttonsHTML = buttons
      .map(
        (btn) => `
      <button class="px-6 py-2.5 rounded-lg font-bold transition-all ${
        btn.type === "danger"
          ? "bg-red-500 hover:bg-red-600 text-white"
          : btn.type === "success"
            ? "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30"
            : "border border-slate-300 dark:border-[#324467] text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#232f48]"
      }" data-action="${btn.action}">
        ${btn.label}
      </button>
    `,
      )
      .join("");
  }

  modal.innerHTML = `
    <div class="bg-surface-light dark:bg-[#192233] rounded-xl p-8 max-w-md w-full mx-4 border border-slate-200 dark:border-[#324467] shadow-2xl">
      <h2 class="text-slate-900 dark:text-white text-lg font-bold mb-2">${title}</h2>
      <p class="text-slate-600 dark:text-[#92a4c9] text-sm mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        ${buttonsHTML || '<button class="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold" data-action="close">Close</button>'}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "close" || !action) modal.remove();
      else if (window.modalCallback) {
        window.modalCallback(action);
        modal.remove();
      }
    });
  });

  return modal;
}

function showLoading(message = "Processing...") {
  let modal = document.querySelector(".js-loading-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className =
      "js-loading-modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="bg-white dark:bg-[#192233] rounded-lg p-8 flex items-center gap-4 shadow-2xl border border-slate-200 dark:border-[#324467]">
        <div class="loader w-8 h-8 border-4 border-t-primary border-slate-200 dark:border-[#324467] rounded-full animate-spin"></div>
        <div class="text-sm text-slate-700 dark:text-slate-200">${message}</div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.querySelector("div > div:last-child").textContent = message;
    modal.classList.remove("hidden");
  }
}

function hideLoading() {
  const modal = document.querySelector(".js-loading-modal");
  if (modal) modal.remove();
}

// ==================== Storage Functions ====================
function saveDraft() {
  const titleInput = document.querySelector(
    'input[placeholder*="Linear Algebra"]',
  );
  const gradeSelect = document.querySelector("select");
  const questions = collectQuestions();

  const draftData = {
    title: titleInput?.value || "",
    grade: gradeSelect?.value || "",
    timeLimit: document.getElementById("quiz-time-limit")?.value || "0",
    questions,
    savedAt: new Date().toLocaleString(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
  console.log("Draft saved to session storage", draftData);
}

function loadDraft() {
  const draftData = sessionStorage.getItem(STORAGE_KEY);

  try {
    if (!draftData) {
      addQuestion();
      return;
    }

    const data = JSON.parse(draftData);
    const titleInput = document.querySelector(
      'input[placeholder*="Linear Algebra"]',
    );
    const gradeSelect = document.querySelector("select");

    if (titleInput) titleInput.value = data.title || "";
    if (gradeSelect) gradeSelect.value = data.grade || "";
    const timeLimitInput = document.getElementById("quiz-time-limit");
    if (timeLimitInput) timeLimitInput.value = data.timeLimit ?? "0";

    const questionsContainer = document.querySelector(".flex.flex-col.gap-6");
    const defaultQuestion =
      questionsContainer?.querySelector(".question-block");
    if (defaultQuestion) questionsContainer.removeChild(defaultQuestion);

    if (data.questions && data.questions.length > 0) {
      data.questions.forEach((q, idx) => addQuestion(q, idx + 1));
    } else {
      addQuestion();
    }

    console.log("Draft loaded from session storage");
  } catch (err) {
    console.error("Error loading draft:", err);
    addQuestion();
  }
}

function clearDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
  console.log("Draft cleared from session storage");
}

// ==================== Question Management ====================
function collectQuestions() {
  const blocks = document.querySelectorAll(".question-block");

  const questions = Array.from(blocks).map((block) => {
    const isImageMode = block.dataset.type === "image";
    const qText = block.querySelector("textarea")?.value || "";

    let options = [];
    let answer;

    if (isImageMode) {
      // Image questions: fixed A/B/C/D
      options = ["A", "B", "C", "D"];
      const radios = block.querySelectorAll('input[type="radio"]');
      const checkedRadio = Array.from(radios).find((r) => r.checked);
      answer = checkedRadio ? checkedRadio.value : "A";
    } else {
      // Text questions: editable inputs
      const optionInputs = block.querySelectorAll("input[data-option-index]");
      optionInputs.forEach((input) => options.push(input.value || ""));
      const radios = block.querySelectorAll('input[type="radio"]');
      const checkedRadio = Array.from(radios).find((r) => r.checked);
      answer = checkedRadio ? checkedRadio.value : "A";
    }

    const imageFile = block.querySelector('input[type="file"]')?.files?.[0];

    return {
      question: qText,
      options: options.slice(0, 4),
      answer,
      type: isImageMode ? "image" : "text",
      image: imageFile || null,
    };
  });

  return questions;
}

// ==================== The rest of the JS (createQuestionBlock, addQuestion, publishQuiz, updateQuestionNumbers, etc.) ====================
// Remains exactly the same as your original code
// Only `collectQuestions` has been updated to handle image vs text options properly

// ==================== The rest of your JS (createQuestionBlock, addQuestion, publishQuiz, etc.) ====================
// Remains exactly the same as before, only collectQuestions is changed

function createQuestionBlock(data = null, questionNumber = null) {
  const blockNum =
    questionNumber || document.querySelectorAll(".question-block").length + 1;
  const isImageMode = data?.type === "image";

  const block = document.createElement("div");
  block.className =
    "group question-block relative bg-surface-light dark:bg-[#192233] rounded-xl border border-slate-200 dark:border-[#324467] overflow-hidden shadow-sm transition-all hover:border-primary/50 dark:hover:border-primary/50";
  block.dataset.type = isImageMode ? "image" : "text";
  block.dataset.questionIndex = blockNum - 1;

  const answerIndex =
    typeof data?.answer === "string"
      ? ["A", "B", "C", "D"].indexOf(data.answer)
      : data?.answer;

  const textOptionsHTML = ["A", "B", "C", "D"]
    .map(
      (letter, idx) => `
    <div class="relative group/option">
      <div class="flex items-center gap-3 mb-1.5">
        <div class="w-6 h-6 rounded-full border border-slate-300 dark:border-[#324467] flex items-center justify-center text-xs font-bold text-slate-500 dark:text-[#92a4c9] bg-slate-100 dark:bg-[#111722]">
          ${letter}
        </div>
        <label class="text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider">Option ${idx + 1}</label>
      </div>
      <div class="flex items-center">
        <input
          class="flex-1 h-11 px-4 rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Answer for Option ${letter}"
          type="text"
          data-option-index="${idx}"
          value="${data?.options?.[idx] || ""}"
        />
        <div class="ml-3 flex items-center gap-2">
          <input
            class="w-5 h-5 text-primary bg-slate-100 dark:bg-[#111722] border-slate-300 dark:border-[#324467] focus:ring-primary"
            id="q${blockNum}_${letter.toLowerCase()}"
            name="correct_q${blockNum}"
            type="radio"
            value="${letter}"
            ${answerIndex === idx ? "checked" : ""}
          />
          <label class="text-sm text-slate-500 dark:text-[#92a4c9] cursor-pointer" for="q${blockNum}_${letter.toLowerCase()}" title="Mark as correct">
          </label>
           <div class="js-correct-symbol text-primary ${answerIndex === idx ? "" : "hidden"}">
                <span class="material-symbols-outlined">check_circle</span>
           </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  // Image question → only radio buttons A/B/C/D
  const imageOptionsHTML = ["A", "B", "C", "D"]
    .map(
      (letter, idx) => `
    <div class="flex items-center gap-2 mb-2">
      <input
        class="w-5 h-5 text-primary border-slate-300 dark:border-[#324467] focus:ring-primary"
        id="q${blockNum}_${letter.toLowerCase()}"
        name="correct_q${blockNum}"
        type="radio"
        value="${letter}"
        ${answerIndex === idx ? "checked" : ""}
      />
      <label class="text-sm text-slate-500 dark:text-[#92a4c9]" for="q${blockNum}_${letter.toLowerCase()}">${letter}</label>
      <div class="js-correct-symbol text-primary ${answerIndex === idx ? "" : "hidden"}">
          <span class="material-symbols-outlined">check_circle</span>
      </div>
    </div>
  `,
    )
    .join("");

  // ===================== Block HTML =====================
  block.innerHTML = `
    <div class="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
    <div class="p-6">
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
          <span class="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">${blockNum}</span>
          Question Setup
        </h3>
        <div class="flex gap-2">
          <button class="js-duplicate-btn p-2 text-slate-400 hover:text-primary transition-colors" title="Duplicate">
            <span class="material-symbols-outlined text-[20px]">content_copy</span>
          </button>
          <button class="js-delete-btn p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>

      <div class="flex gap-6 mb-6 border-b border-slate-200 dark:border-[#324467]">
        <label class="js-text-mode cursor-pointer pb-3 border-b-2 ${!isImageMode ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-[#92a4c9]"} font-medium text-sm flex items-center gap-2 transition-colors hover:text-slate-700 dark:hover:text-white">
          <input type="radio" name="q${blockNum}_mode" value="text" ${!isImageMode ? "checked" : ""} style="display: none;">
          <span class="material-symbols-outlined text-[18px]">text_fields</span>
          Text Question
        </label>
        <label class="js-image-mode cursor-pointer pb-3 border-b-2 ${isImageMode ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-[#92a4c9]"} font-medium text-sm flex items-center gap-2 transition-colors hover:text-slate-700 dark:hover:text-white">
          <input type="radio" name="q${blockNum}_mode" value="image" ${isImageMode ? "checked" : ""} style="display: none;">
          <span class="material-symbols-outlined text-[18px]">image</span>
          Image Upload
        </label>
      </div>

      <div class="js-text-section ${isImageMode ? "hidden" : ""}">
        <div class="mb-8">
          <label class="block mb-2 text-slate-900 dark:text-white text-sm font-medium">Question Text</label>
          <textarea
            class="w-full min-h-[120px] p-4 rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-[#324467] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            placeholder="Enter the math problem here... Use LaTeX for formulas if needed."
          >${data?.question || ""}</textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          ${textOptionsHTML}
        </div>
      </div>

      <div class="js-image-section ${!isImageMode ? "hidden" : ""}">
        <div class="mb-6">
          <label class="block mb-2 text-slate-900 dark:text-white text-sm font-medium">Upload Image with Options</label>
          <div class="relative border-2 border-dashed border-slate-300 dark:border-[#324467] rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" />
            <div class="pointer-events-none">
              <span class="material-symbols-outlined text-4xl text-slate-400 dark:text-[#92a4c9] inline-block mb-2">image</span>
              <p class="text-sm text-slate-600 dark:text-[#92a4c9] font-medium">Click to upload image</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">PNG, JPG up to 10MB</p>
            </div>
            <div class="js-image-preview mt-4 hidden">
              <img class="max-h-48 mx-auto rounded-lg" />
            </div>
          </div>
        </div>
        <div class="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">info</span>
          <span>For image questions, ensure the image contains clearly labeled options A, B, C, D.</span>
        </div>
        <div class="mt-4">${imageOptionsHTML}</div>
      </div>
    </div>
  `;

  // ===================== Event listeners (radio buttons) =====================
  const radioButtons = block.querySelectorAll(
    'input[type="radio"][name^="correct_q"]',
  );
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      // Hide all symbols within this question block
      block.querySelectorAll(".js-correct-symbol").forEach((symbol) => {
        symbol.classList.add("hidden");
      });
      // Show symbol for the checked radio
      if (radio.checked) {
        // Find the symbol within the radio's parent container
        const symbol = radio.parentElement.querySelector(".js-correct-symbol");
        if (symbol) {
          symbol.classList.remove("hidden");
        }
      }
    });
  });

  // ===================== Event listeners (mode switch, duplicate, delete, image preview) =====================
  const textModeLabel = block.querySelector(".js-text-mode");
  const imageModeLabel = block.querySelector(".js-image-mode");
  const textSection = block.querySelector(".js-text-section");
  const imageSection = block.querySelector(".js-image-section");

  textModeLabel?.addEventListener("click", (e) => {
    e.preventDefault();
    block.dataset.type = "text";
    textModeLabel.classList.add("border-primary", "text-primary");
    textModeLabel.classList.remove(
      "border-transparent",
      "text-slate-500",
      "dark:text-[#92a4c9]",
    );
    imageModeLabel.classList.remove("border-primary", "text-primary");
    imageModeLabel.classList.add(
      "border-transparent",
      "text-slate-500",
      "dark:text-[#92a4c9]",
    );
    textSection?.classList.remove("hidden");
    imageSection?.classList.add("hidden");
    saveDraft();
  });

  imageModeLabel?.addEventListener("click", (e) => {
    e.preventDefault();
    block.dataset.type = "image";
    imageModeLabel.classList.add("border-primary", "text-primary");
    imageModeLabel.classList.remove(
      "border-transparent",
      "text-slate-500",
      "dark:text-[#92a4c9]",
    );
    textModeLabel.classList.remove("border-primary", "text-primary");
    textModeLabel.classList.add(
      "border-transparent",
      "text-slate-500",
      "dark:text-[#92a4c9]",
    );
    textSection?.classList.add("hidden");
    imageSection?.classList.remove("hidden");
    saveDraft();
  });

  const fileInput = block.querySelector('input[type="file"]');
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = block.querySelector(".js-image-preview");
        const img = preview?.querySelector("img");
        if (img) {
          img.src = event.target?.result;
          preview?.classList.remove("hidden");
        }
      };
      reader.readAsDataURL(file);
    }
  });

  const duplicateBtn = block.querySelector(".js-duplicate-btn");
  duplicateBtn?.addEventListener("click", () => {
    const questions = collectQuestions();
    const currentIndex = parseInt(block.dataset.questionIndex);
    addQuestion(questions[currentIndex]);
  });

  const deleteBtn = block.querySelector(".js-delete-btn");
  deleteBtn?.addEventListener("click", () => {
    const blocks = document.querySelectorAll(".question-block");
    if (blocks.length <= 1) {
      showModal(
        "Cannot Delete",
        "You must have at least one question in the quiz.",
        [{ label: "OK", action: "close", type: "info" }],
      );
      return;
    }

    window.modalCallback = (action) => {
      if (action === "confirm") {
        block.remove();
        updateQuestionNumbers();
        updateQuestionCount();
        saveDraft();
      }
    };

    showModal(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        { label: "Cancel", action: "cancel", type: "cancel" },
        { label: "Delete", action: "confirm", type: "danger" },
      ],
    );
  });

  block.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("change", saveDraft);
    el.addEventListener("blur", saveDraft);
  });

  return block;
}

function addQuestion(data = null, questionNumber = null) {
  const block = createQuestionBlock(data, questionNumber);
  const questionsContainer = document.querySelector(".flex.flex-col.gap-6");
  const addBtn = questionsContainer?.querySelector(".button-add-question");

  if (addBtn) questionsContainer?.insertBefore(block, addBtn);
  else questionsContainer?.appendChild(block);

  updateQuestionNumbers();
  updateQuestionCount();
  saveDraft();
}

function updateQuestionNumbers() {
  const blocks = document.querySelectorAll(".question-block");
  blocks.forEach((block, idx) => {
    const numberSpan = block.querySelector(".bg-primary span");
    if (numberSpan) numberSpan.textContent = idx + 1;
    block.dataset.questionIndex = idx;

    block.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.name = `correct_q${idx + 1}`;
      radio.id = `q${idx + 1}_${radio.id.split("_")[1]}`;
    });
  });
}

function updateQuestionCount() {
  const count = document.querySelectorAll(".question-block").length;
  const countDisplay = document.querySelector(".js-question-count");
  if (countDisplay)
    countDisplay.textContent = `${count} Question${count !== 1 ? "s" : ""} Added`;

  const timeDisplay = document.querySelector(".js-last-saved");
  if (timeDisplay)
    timeDisplay.textContent = `Last saved ${new Date().toLocaleTimeString()}`;
}

// ==================== Quiz Publishing ====================
async function publishQuiz() {
  const titleInput = document.querySelector(
    'input[placeholder*="Linear Algebra"]',
  );
  const gradeSelect = document.querySelector("select");

  const title = titleInput?.value?.trim();
  const grade = gradeSelect?.value;

  if (!title) {
    showModal("Missing Title", "Please provide a title for the quiz.", [
      { label: "OK", action: "close", type: "info" },
    ]);
    return;
  }

  if (!grade) {
    showModal("Missing Grade", "Please select a grade level for the quiz.", [
      { label: "OK", action: "close", type: "info" },
    ]);
    return;
  }

  const questions = collectQuestions();
  if (questions.length === 0) {
    showModal("No Questions", "Please add at least one question to the quiz.", [
      { label: "OK", action: "close", type: "info" },
    ]);
    return;
  }

  const fd = new FormData();
  fd.append("title", title);
  fd.append("grade", grade);
  const timeLimit = document.getElementById("quiz-time-limit")?.value || 0;
  fd.append("timeLimit", timeLimit);
  fd.append("questions", JSON.stringify(questions));

  document.querySelectorAll(".question-block").forEach((block, idx) => {
    const fileInput = block.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files[0])
      fd.append(`image${idx}`, fileInput.files[0]);
  });

  try {
    showLoading("Creating quiz...");
    await apiFetch("/admin/quizzes", { method: "POST", body: fd });
    hideLoading();
    clearDraft();
    showModal("Success", "Quiz published successfully!", [
      { label: "View Quizzes", action: "success", type: "success" },
    ]);

    window.modalCallback = (action) => {
      if (action === "success") window.location.href = "manage-quizzes.html";
    };
  } catch (err) {
    hideLoading();
    console.error(err);
    showModal(
      "Error",
      err.message || err.payload?.message || "Failed to create quiz",
      [{ label: "OK", action: "close", type: "info" }],
    );
  }
}

// ==================== Event Listeners ====================
document.addEventListener("DOMContentLoaded", () => {
  loadDraft();

  const draftBtn = document.getElementById("save-draft-btn");
  draftBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    saveDraft();
    showModal("Draft Saved", "Your quiz draft has been saved successfully.", [
      { label: "OK", action: "close", type: "success" },
    ]);
  });

  const publishBtn = document.getElementById("publish-quiz-btn");
  publishBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    publishQuiz();
  });

  const addQuestionBtn = document.querySelector(".button-add-question");
  addQuestionBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    addQuestion();
  });

  window.addEventListener("beforeunload", saveDraft);

  updateQuestionCount();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) saveDraft();
});
