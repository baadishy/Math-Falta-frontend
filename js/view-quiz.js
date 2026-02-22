import { getJSON, putJSON } from "./app.js";

// State management
let currentQuiz = null;
let allUserResults = [];
let filteredResults = [];
let totalQuestionsCount = 0;
let currentPage = 1;
const resultsPerPage = 4;

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  // Load quiz data
  await loadQuizDetails();
  setupSearch();

  // Add delete button near the title
  addDeleteButton();

  // Edit button handler (moved here so admin-layout imports are not required)
  const editBtn = document.getElementById("edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const quizId = getParam("id");
      if (quizId) {
        window.location.href = `/edit-quiz.html?id=${quizId}`;
      }
    });
  }
});

// Load quiz questions and details
async function loadQuizDetails() {
  const quizId = getParam("id");
  if (!quizId) {
    showError("Quiz ID not found.");
    return;
  }

  try {
    // Use main endpoint which returns full quiz data with questions and results
    const res = await getJSON(`/admin/quizzes/${quizId}`);
    const quiz = res.data;

    if (!quiz) {
      showError("Quiz not found.");
      return;
    }

    currentQuiz = quiz;
    totalQuestionsCount = (quiz.questions || []).length;
    updatePageTitle(quiz.title);
    updateChips(quiz);
    displayQuestions(quiz.questions || []);

    // Load user results from quiz data if available
    if (quiz.detailedResults) {
      processResults(quiz.detailedResults);
    }

    updateStats(quiz);
  } catch (error) {
    console.error("Error loading quiz:", error);
    showError("Failed to load quiz details. Please try again.");
  }
}

// Update page title
function updatePageTitle(title) {
  document.getElementById("quiz-title").textContent = title;
  // const h1 = document.querySelector("h1");
  // if (h1) h1.textContent = title;
}

// Update chips (grade and questions count)
function updateChips(quiz) {
  const gradeChip = document.getElementById("grade-chip");
  if (gradeChip) gradeChip.textContent = `Grade ${quiz.grade}`;

  const questionsChip = document.getElementById("questions-count");
  if (questionsChip)
    questionsChip.textContent = `${(quiz.questions || []).length} Questions`;

  const timeText = document.getElementById("time-limit-text");
  if (timeText) {
    const tl = Number(quiz.timeLimit) || 0;
    timeText.textContent = tl > 0 ? `${tl} min` : "No limit";
  }
}

// Process user results
function processResults(results) {
  allUserResults = results
    .map((result) => {
      const rawScore = result.score || 0;
      const percentage =
        totalQuestionsCount > 0
          ? Math.round((rawScore / totalQuestionsCount) * 100)
          : 0;

      return {
        userName: result.user?.name || "Unknown",
        userEmail: result.user?.email || "N/A",
        totalScore: result.user?.totalScore || 0,
        quizScore: percentage,
        rawScore: rawScore,
        createdAt: result.createdAt,
        timeTaken: result.timeTaken ?? null,
      };
    })
    .sort((a, b) => b.quizScore - a.quizScore);

  filteredResults = [...allUserResults];
  currentPage = 1;
  displayResults();
  updatePaginationInfo();
}

// Update quiz statistics
function updateStats(quiz) {
  const attempts = allUserResults.length;
  document.getElementById("total-attempts").textContent = attempts;

  if (attempts > 0) {
    const avgScore = Math.round(
      allUserResults.reduce((sum, r) => sum + (r.quizScore || 0), 0) / attempts,
    );
    document.getElementById("average-score").textContent = `${avgScore}%`;
    document.getElementById("average-bar").style.width = `${avgScore}%`;

    const highScore = Math.max(...allUserResults.map((r) => r.quizScore || 0));
    const highScoreCount = allUserResults.filter(
      (r) => r.quizScore === highScore,
    ).length;
    document.getElementById("high-score").textContent = `${highScore}%`;
    document.getElementById("high-score-count").textContent =
      `Achieved by ${highScoreCount} student${highScoreCount !== 1 ? "s" : ""}`;
  } else {
    document.getElementById("average-score").textContent = "N/A";
    document.getElementById("average-bar").style.width = `0%`;
    document.getElementById("high-score").textContent = "N/A";
    document.getElementById("high-score-count").textContent = "N/A";
  }
}

// Display quiz questions
function displayQuestions(questions) {
  const container = document.getElementById("questions-section");
  if (!container) return;

  container.innerHTML = "";

  if (!questions || questions.length === 0) {
    container.innerHTML =
      '<p class="text-slate-500 dark:text-slate-400">No questions available</p>';
    return;
  }

  const heading = document.createElement("h2");
  heading.className =
    "text-lg font-bold text-slate-900 dark:text-white mt-6 mb-4";
  heading.textContent = "Questions Preview";
  container.appendChild(heading);

  questions.forEach((q, index) => {
    const questionCard = document.createElement("div");
    questionCard.className =
      "bg-surface-light dark:bg-[#1e293b] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-4";

    const question = document.createElement("h3");
    question.className =
      "text-lg font-semibold text-slate-900 dark:text-white mb-3";
    question.textContent = `Question ${index + 1}: ${q.question}`;
    questionCard.appendChild(question);

    if (q.image?.url || q.imageUrl) {
      const wrapper = document.createElement("div");
      wrapper.className = "mb-4 flex justify-center";
      const img = document.createElement("img");
      img.src = q.image?.url || q.imageUrl;
      img.alt = "Question Image";
      img.className = "rounded-lg max-w-full h-auto max-h-80";
      wrapper.appendChild(img);
      questionCard.appendChild(wrapper);
    }

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "space-y-2";

    const options = q.options || [];
    options.forEach((option, optIndex) => {
      const optionLabel = document.createElement("div");

      // Handle both string answers (A, B, C, D) and numeric answers (0, 1, 2, 3)
      let correctAnswerIndex = q.answer;
      if (typeof q.answer === "string") {
        correctAnswerIndex = q.answer.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
      }

      const isCorrect = optIndex === correctAnswerIndex;
      optionLabel.className = `flex items-center p-3 rounded-md border transition-colors ${
        isCorrect
          ? "border-green-500 bg-green-50 dark:bg-green-500/10"
          : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
      }`;

      const circle = document.createElement("div");
      circle.className = `w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
        isCorrect
          ? "border-green-500 bg-green-500"
          : "border-slate-400 dark:border-slate-500"
      }`;

      const label = document.createElement("label");
      label.className = `text-sm font-medium flex-grow ${
        isCorrect
          ? "text-green-700 dark:text-green-300"
          : "text-slate-700 dark:text-slate-300"
      } cursor-pointer`;
      label.textContent = option;

      optionLabel.appendChild(circle);
      optionLabel.appendChild(label);

      if (isCorrect) {
        const check = document.createElement("span");
        check.className =
          "material-symbols-outlined text-green-500 ml-2 text-[20px] icon-fill";
        check.textContent = "check_circle";
        optionLabel.appendChild(check);
      }

      optionsDiv.appendChild(optionLabel);
    });

    questionCard.appendChild(optionsDiv);
    container.appendChild(questionCard);
  });
}

// Display results in table
function displayResults() {
  const tbody = document.getElementById("quiz-results");
  if (!tbody) return;

  tbody.innerHTML = "";

  const resultsToShow = filteredResults; // show all users on one page

  if (resultsToShow.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="text-center py-8 text-slate-500 dark:text-slate-400">No results found</td>`;
    tbody.appendChild(row);
    return;
  }

  resultsToShow.forEach((result) => {
    const row = document.createElement("tr");
    row.className =
      "border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";

    const studentName = result.userName || "Unknown";
    const studentEmail = result.userEmail || "N/A";
    const totalScore = result.totalScore || 0;
    const quizScore = result.quizScore || 0;
    const rawQuizScore = result.rawScore || 0;
    const totalQuestions = totalQuestionsCount;
    const date = result.createdAt
      ? new Date(result.createdAt).toLocaleString()
      : "-";
    const timeTakenLabel = result.timeTaken
      ? (() => {
          const s = Number(result.timeTaken) || 0;
          const mm = Math.floor(s / 60);
          const ss = s % 60;
          return `${mm}m ${ss}s`;
        })()
      : "-";

    // First column: avatar + name & email
    const initials = (studentName || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    row.innerHTML = `
  <!-- Student (name + email) -->
  <td class="px-4 py-3">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-800 dark:text-white">
        ${escapeHtml(initials)}
      </div>
      <div class="leading-tight">
        <div class="text-sm font-medium text-slate-900 dark:text-white">
          ${escapeHtml(studentName)}
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400">
          ${escapeHtml(studentEmail)}
        </div>
      </div>
    </div>
  </td>

  <!-- Attempt Date -->
  <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
    ${date}
  </td>

  <!-- Total Score -->
  <td class="px-4 py-3 text-sm text-center font-semibold text-blue-600">
    ${totalScore}
  </td>

  <!-- Quiz Score -->
  <td class="px-4 py-3 text-sm text-center">
  <span class="inline-flex flex-col items-center px-3 py-1 rounded-full text-xs font-semibold ${
    quizScore >= 75
      ? "bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400"
      : quizScore >= 50
        ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400"
        : "bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400"
  }">
    <span>${rawQuizScore} / ${totalQuestions}</span>
    <span class="text-[11px] opacity-80">(${quizScore}%)</span>
  </span>
</td>
  <td class="px-4 py-3 text-sm text-center">${escapeHtml(timeTakenLabel)}</td>
`;
    tbody.appendChild(row);
  });
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      filteredResults = allUserResults.filter((result) => {
        const name = (result.userName || "").toLowerCase();
        const email = (result.userEmail || "").toLowerCase();
        return name.includes(query) || email.includes(query);
      });
      currentPage = 1;
      displayResults();
      updatePaginationInfo();
    });
  }
}

// Setup pagination buttons
// Pagination removed; keep a noop function for compatibility
function setupPaginationButtons() {
  return;
}

// Update pagination info
function updatePaginationInfo() {
  const total = filteredResults.length;
  const totalEl = document.getElementById("result-total");
  if (totalEl) totalEl.textContent = total;
}

// Add delete button near page title and wire soft-delete behavior
function addDeleteButton() {
  const actions = document.getElementById("quiz-actions");
  if (!actions) return;

  if (document.getElementById("delete-quiz-btn")) return;

  const btn = document.createElement("button");
  btn.id = "delete-quiz-btn";
  btn.className =
    "flex items-center justify-center h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition-all";
  btn.innerHTML = `
    <span class="material-symbols-outlined text-[20px] mr-2">delete</span>
    Delete Quiz
  `;

  if (currentQuiz?.isDeleted) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
  }

  btn.addEventListener("click", async () => {
    const quizId = getParam("id");
    if (!quizId) return showToast("Quiz ID missing.", "error");

    const confirmed = await createConfirmationPrompt(
      "Delete this quiz? It can be restored later.",
    );
    if (!confirmed) return;

    try {
      showLoading("Deleting quiz...");
      await putJSON(`/admin/quizzes/${quizId}/delete`, {});
      hideLoading();
      showToast("Quiz deleted", "success");
      window.location.href = "manage-quizzes.html";
    } catch (err) {
      hideLoading();
      console.error("Delete failed:", err);
      showToast("Failed to delete quiz. Please try again.", "error");
    }
  });

  actions.appendChild(btn);
}

// Utility function to escape HTML
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Show error message
function showError(message) {
  const header = document.querySelector("header");
  if (header) {
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 m-4 rounded-lg text-red-700 dark:text-red-400 text-sm";
    errorDiv.textContent = message;
    header.insertAdjacentElement("afterend", errorDiv);

    // Auto-remove error after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  }
}

// Toast / modal helpers (copied from edit-quiz.js / add-edit-lesson.js)
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
