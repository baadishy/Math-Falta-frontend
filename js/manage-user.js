import { getJSON, postJSON, putJSON } from "./app.js";
import { showToast } from "./ui.js";

const overlay = document.getElementById("quiz-detail-overlay");
const drawer = document.getElementById("quiz-detail-drawer");
const closeBtn = document.getElementById("quiz-detail-close");
const quizzesBody = document.getElementById("completed-quizzes-body");
const quizzesEmpty = document.getElementById("completed-quizzes-empty");
const lessonsList = document.getElementById("opened-lessons-list");
const lessonsEmpty = document.getElementById("opened-lessons-empty");
const editProfileBtn = document.getElementById("edit-profile-btn");
const messageUserBtn = document.getElementById("message-user-btn");

const state = {
  user: null,
  quizzes: [],
  currentQuiz: null,
  reports: [],
};

function getCurrentQuizId() {
  const q = state.currentQuiz;
  console.log(q);
  if (!q) return null;
  // attempt common fields where quiz id may be stored
  return (
    q.quizId || (q.quiz && (q.quiz._id || q.quizId)) || q._id || q.id || null
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}

function scorePercent(score, total) {
  if (!total || total <= 0) return null;
  return Math.round((score / total) * 100);
}

function gradeLabel(percent) {
  if (percent === null) return { label: "N/A", status: "Pending" };
  if (percent >= 90) return { label: "A", status: "Passed" };
  if (percent >= 80) return { label: "B", status: "Passed" };
  if (percent >= 70) return { label: "C", status: "Review" };
  if (percent >= 60) return { label: "D", status: "Review" };
  return { label: "F", status: "Needs Help" };
}

function statusClass(status) {
  if (status === "Passed") {
    return "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20";
  }
  if (status === "Review") {
    return "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20";
  }
  return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-600/20";
}

function setText(id, value, fallback = "-") {
  const el = document.getElementById(id);
  if (el) {
    el.textContent =
      value === null || value === undefined || value === "" ? fallback : value;
  }
}

function setHtml(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = value;
  }
}

function showDrawer() {
  if (!overlay || !drawer) return;
  overlay.classList.remove("opacity-0", "pointer-events-none");
  overlay.classList.add("opacity-100");
  drawer.classList.remove("translate-x-full");
}

function hideDrawer() {
  if (!overlay || !drawer) return;
  overlay.classList.add("opacity-0", "pointer-events-none");
  overlay.classList.remove("opacity-100");
  drawer.classList.add("translate-x-full");
}

function renderUserHeader(user) {
  setText("breadcrumb-user-name", user.name || "User");
  setText("profile-name", user.name || "User");
  setText("profile-grade", user.grade ? `Grade ${user.grade}` : "Grade -");
  setText("profile-email", user.email || "-");
  setText(
    "profile-parent",
    user.parentNumber ? `Parent: ${user.parentNumber}` : "Parent: -",
  );
  const score = typeof user.totalScore === "number" ? user.totalScore : 0;
  setText("profile-score", score.toLocaleString());

  const avatar = document.getElementById("profile-avatar");
  if (avatar) {
    avatar.alt = user.name
      ? `Profile photo of ${user.name}`
      : "Student profile";
  }
}

function renderReportLink(report) {
  const holder = document.getElementById("quiz-report-holder");
  const link = document.getElementById("quiz-report-link");
  const meta = document.getElementById("quiz-report-meta");
  const regen = document.getElementById("quiz-report-regenerate");
  if (!holder || !link) return;

  // hide regenerate button (we always generate fresh reports on Download)
  if (regen) regen.classList.add("hidden");

  if (!report) {
    holder.classList.add("hidden");
    return;
  }

  // link.href = report.url;
  // // Link opens the viewer page which embeds the report URL for preview/download
  // const viewerUrl = `${window.location.origin}/view-report.html?url=${encodeURIComponent(
  //   report.url,
  // )}`;
  // link.href = viewerUrl;
  // link.textContent = `Open Report (${new Date(report.createdAt).toLocaleString()})`;
  // if (meta)
  //   meta.textContent = ` • ${report.quizId ? "Quiz report" : "Full report"}`;
  // holder.classList.remove("hidden");
  // // regen intentionally not shown
}

function renderQuizzes(quizzes) {
  if (!quizzesBody || !quizzesEmpty) return;
  quizzesBody.innerHTML = "";
  if (!quizzes || quizzes.length === 0) {
    quizzesEmpty.classList.remove("hidden");
    return;
  }
  quizzesEmpty.classList.add("hidden");

  quizzes.forEach((quiz, index) => {
    const total = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
    const percent = scorePercent(quiz.score || 0, total);
    const grade = gradeLabel(percent);
    const percentLabel = percent === null ? "-" : `${percent}%`;
    const dateLabel = formatDate(quiz.createdAt);

    const row = document.createElement("tr");
    row.className =
      "hover:bg-slate-50 dark:hover:bg-[#232f48] transition-colors group cursor-pointer";
    row.dataset.index = String(index);

    row.innerHTML = `
      <td class="px-6 py-4">
        <div class="font-medium text-slate-900 dark:text-white">${escapeHtml(
          quiz.title || "Untitled Quiz",
        )}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Grade ${escapeHtml(state.user?.grade || "-")}
        </div>
      </td>
      <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${escapeHtml(
        dateLabel,
      )}</td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
          grade.status,
        )}">${escapeHtml(grade.status)}</span>
      </td>
      <td class="px-6 py-4">${escapeHtml(
        quiz.timeTaken
          ? `${Math.floor(quiz.timeTaken / 60)}m ${quiz.timeTaken % 60}s`
          : "-",
      )}</td>
      <td class="px-6 py-4 text-right">
        <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(
          percentLabel,
        )}</span>
        <span class="text-xs text-slate-400 ml-1">(${escapeHtml(
          grade.label,
        )})</span>
      </td>
      <td class="px-6 py-4 text-right">
        <button
          class="text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-white transition-colors"
          data-action="view"
          data-index="${index}"
          aria-label="View quiz details"
        >
          <span class="material-symbols-outlined">visibility</span>
        </button>
      </td>
    `;

    quizzesBody.appendChild(row);
  });
}

function renderLessons(activities) {
  if (!lessonsList || !lessonsEmpty) return;
  lessonsList.innerHTML = "";

  if (!activities || activities.length === 0) {
    lessonsEmpty.classList.remove("hidden");
    return;
  }

  lessonsEmpty.classList.add("hidden");

  activities.forEach((lesson, index) => {
    const title = lesson.title || "Lesson";
    const topic = lesson.topic || "General";

    const progressRaw =
      typeof lesson.progress === "number" && lesson.progress >= 0
        ? Math.min(Math.round(lesson.progress), 100)
        : 0;
    const progress = progressRaw;
    const progressText =
      progressRaw === 100 ? "Completed" : `${progressRaw}% Watched`;
    const barClass = progressRaw === 100 ? "bg-purple-500" : "bg-purple-300";

    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-[#192233] p-4 rounded-xl border border-slate-200 dark:border-[#232f48] shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-colors group cursor-pointer";

    // optional: click to open lesson page or video
    card.addEventListener("click", () => {
      if (lesson.videoUrl) {
        window.open(lesson.videoUrl, "_blank");
      }
    });

    const iconClass =
      index % 3 === 0
        ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        : index % 3 === 1
          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400";

    const iconName =
      index % 3 === 0
        ? "play_lesson"
        : index % 3 === 1
          ? "calculate"
          : "functions";

    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="${iconClass} rounded-lg p-2 shrink-0">
          <span class="material-symbols-outlined">${iconName}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
            ${escapeHtml(title)}
          </h4>

          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Topic: ${escapeHtml(topic)}
          </p>

          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ${progressText}
          </p>

          <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-2">
            <div class="${barClass} h-1.5 rounded-full" style="width: ${progress}%"></div>
          </div>

          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right">
            Opened ${escapeHtml(timeAgo(lesson.lastOpened) || "-")}
          </p>
        </div>
      </div>
    `;

    lessonsList.appendChild(card);
  });
}

function answerToOptionText(answer, options) {
  if (!answer || !Array.isArray(options)) return answer || "-";

  const indexMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  const idx = indexMap[String(answer).toUpperCase()];

  if (idx === undefined || !options[idx]) return answer;
  return options[idx];
}

function createQuestionHtml(q, idx) {
  const isCorrect = Boolean(q.isCorrect);
  const statusIcon = isCorrect ? "check_circle" : "cancel";
  const statusColor = isCorrect ? "text-green-500" : "text-red-500";

  const badgeClass = isCorrect
    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";

  const answerBg = isCorrect
    ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30"
    : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30";

  // 🟢 Question rendering (image OR text)
  const questionHtml = q.image
    ? `
      <img
        src="${escapeHtml(q.image.url)}"
        alt="Question image"
        class="max-w-full rounded-lg border border-slate-200 dark:border-[#232f48]"
      />
    `
    : `
      <p class="text-sm font-medium text-slate-900 dark:text-white">
        ${escapeHtml(q.question || "Question")}
      </p>
    `;

  // 🟢 Answers (convert A/B/C → option text if possible)
  const studentAnswerText = answerToOptionText(q.userAnswer, q.options);
  const correctAnswerText = answerToOptionText(q.correctAnswer, q.options);

  const studentAnswerHtml = `
    <div class="flex items-center gap-2 text-sm p-2 rounded ${answerBg} border">
      <span class="font-semibold text-slate-700 dark:text-slate-300 w-16">Student:</span>
      <span class="text-slate-900 dark:text-white">
        ${escapeHtml(studentAnswerText || "-")}
      </span>
    </div>
  `;

  const correctAnswerHtml = isCorrect
    ? ""
    : `
      <div class="flex items-center gap-2 text-sm p-2 rounded bg-slate-50 dark:bg-[#192233] border border-slate-200 dark:border-[#324467]">
        <span class="font-semibold text-green-600 dark:text-green-400 w-16">Correct:</span>
        <span class="text-slate-900 dark:text-white">
          ${escapeHtml(correctAnswerText || "-")}
        </span>
      </div>
    `;

  return `
    <div class="border-b border-slate-100 dark:border-[#232f48] pb-6 last:border-0">
      <div class="flex items-start justify-between gap-4">
        <div class="flex gap-3">
          <span class="flex items-center justify-center shrink-0 size-6 rounded ${badgeClass} text-xs font-bold">
            ${idx + 1}
          </span>
          <div class="space-y-2">
            ${questionHtml}
          </div>
        </div>
        <span class="material-symbols-outlined ${statusColor} text-lg">
          ${statusIcon}
        </span>
      </div>

      <div class="ml-9 mt-3 space-y-2">
        ${studentAnswerHtml}
        ${correctAnswerHtml}
      </div>
    </div>
  `;
}

function renderQuizDetail(quiz) {
  state.currentQuiz = quiz;
  console.log(state.currentQuiz);
  const total = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
  const correct = quiz.score || 0;
  const incorrect = Math.max(total - correct, 0);
  const percent = scorePercent(correct, total);
  const grade = gradeLabel(percent);

  setText("quiz-detail-title", quiz.title || "Quiz");
  setText("quiz-detail-grade", percent === null ? "N/A" : `${percent}% Grade`);
  setText("quiz-detail-date", `Date Taken: ${formatDate(quiz.createdAt)}`);
  setText("quiz-detail-correct", `${correct}/${total || "-"}`);
  setText("quiz-detail-incorrect", `${incorrect}/${total || "-"}`);
  // Time spent (seconds) -> display and avg time per question
  const timeSecs = Number(quiz.timeTaken) || 0;
  const timeLabel =
    timeSecs > 0 ? `${Math.floor(timeSecs / 60)}m ${timeSecs % 60}s` : "-";
  setText("quiz-detail-avg-time", "--");
  // update date line to include time spent
  const dateEl = document.getElementById("quiz-detail-date");
  if (dateEl) {
    dateEl.textContent = `Date Taken: ${formatDate(quiz.createdAt)} • Time spent: ${timeLabel}`;
  }

  // avg time per question
  if (timeSecs > 0 && total > 0) {
    const avg = Math.round(timeSecs / total);
    const mm = Math.floor(avg / 60);
    const ss = avg % 60;
    setText("quiz-detail-avg-time", `${mm}m ${ss}s`);
  } else {
    setText("quiz-detail-avg-time", "-");
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const blocks = questions.map(createQuestionHtml).join("");

  setHtml(
    "quiz-detail-questions",
    blocks ||
      '<p class="text-sm text-slate-500 dark:text-slate-400">No questions found.</p>',
  );

  showDrawer();
  // don't show persisted reports; always generate fresh on Download
  renderReportLink(null);
}

function attachQuizEvents() {
  if (!quizzesBody) return;
  quizzesBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='view']");
    const row = event.target.closest("tr");
    const target = button || row;
    if (!target) return;
    const index = target.dataset.index;
    if (!index) return;
    const quiz = state.quizzes[Number(index)];
    if (!quiz) return;
    renderQuizDetail(quiz);
  });
}

function attachDrawerEvents() {
  if (closeBtn) {
    closeBtn.addEventListener("click", hideDrawer);
  }

  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        hideDrawer();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideDrawer();
    }
  });
}

function attachProfileActions() {
  if (messageUserBtn) {
    messageUserBtn.addEventListener("click", () => {
      const phoneRaw = state.user?.parentNumber;
      const name = state.user?.name || "there";

      if (!phoneRaw) {
        showToast(
          "No parent WhatsApp number available for this student.",
          "warning",
        );
        return;
      }

      // 🟢 Clean phone number (remove spaces, +, dashes)
      const phone = phoneRaw.replace(/\D/g, "");

      // 🟢 Message with emoji + new line
      const message = `Hello 👋 ${name}\n\nThis is Math-Falta,\n`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  }

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      if (!state.user) return;
      openEditModal(state.user);
    });
  }
}

function openEditModal(user) {
  const modal = document.getElementById("edit-user-modal");
  if (!modal) return;

  const nameInput = modal.querySelector("#edit-user-name");
  const emailInput = modal.querySelector("#edit-user-email");
  const parentNumberInput = modal.querySelector("#edit-user-parentNumber");
  const gradeInput = modal.querySelector("#edit-user-grade");

  if (nameInput) nameInput.value = user.name || "";
  if (emailInput) emailInput.value = user.email || "";
  if (parentNumberInput) parentNumberInput.value = user.parentNumber || "";
  if (gradeInput) gradeInput.value = user.grade || "";

  modal.classList.remove("hidden");

  const form = modal.querySelector("#edit-user-form");
  const cancel = modal.querySelector("#edit-user-cancel");
  const error = modal.querySelector("#edit-user-error");
  const saveBtn = modal.querySelector("#edit-user-save");

  const closeModal = () => {
    modal.classList.add("hidden");
    form.removeEventListener("submit", handleSubmit);
  };

  cancel.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!error || !saveBtn) return;
    error.classList.add("hidden");

    const formData = new FormData(form);
    const updates = {
      name: formData.get("name").toString().trim(),
      email: formData.get("email").toString().trim(),
      parentNumber: formData.get("parentNumber").toString().trim(),
      grade: formData.get("grade").toString().trim(),
    };

    if (updates.grade && !/^[5-9]$/.test(updates.grade)) {
      error.textContent = "Grade must be between 5 and 9.";
      error.classList.remove("hidden");
      return;
    }

    if (Object.keys(updates).length === 0) {
      closeModal();
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const result = await putJSON(`/admin/users/${user._id}`, updates);
      const updatedUser = result.data || { ...user, ...updates };
      state.user = { ...state.user, ...updatedUser };
      renderUserHeader(state.user);
      closeModal();
    } catch (err) {
      error.textContent =
        err.payload?.message || err.message || "Failed to update user.";
      error.classList.remove("hidden");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  }

  form.addEventListener("submit", handleSubmit);
}

async function loadUser() {
  const userId = getUserId();
  if (!userId) {
    showToast("Missing user id in URL. Returning to users list.", "error");
    setTimeout(() => {
      window.location.href = "manage-users.html";
    }, 800);
    return;
  }

  try {
    const res = await getJSON(`/admin/users/${userId}`);
    const user = res.data || {};
    state.user = user;
    state.quizzes = Array.isArray(user.quizzes) ? user.quizzes : [];

    renderUserHeader(user);
    renderQuizzes(state.quizzes);

    const activities = Array.isArray(user.lessons)
      ? user.lessons.map((lesson) => ({
          ...lesson,
          activityType: "lesson",
        }))
      : [];
    console.log("User lessons activities:", activities);
    renderLessons(activities);
    renderReportLink(null);
  } catch (err) {
    console.error("Failed to load user", err);
    if (err.status === 401 || err.status === 403) {
      window.location.href = "sign-in.html";
      return;
    }
    showToast("Unable to load user details.", "error");
  }
}

async function downloadQuizReport() {
  // Request server to generate a text-based PDF and upload to Cloudinary
  if (!state.user) throw new Error("No user loaded");
  const userId = state.user._id;
  const quizId = getCurrentQuizId();
  if (!quizId) {
    showToast("Open a quiz first to generate its report.", "warning");
    throw new Error("No quiz selected");
  }
  // always request a fresh report from the server (force regenerate)
  const payload = quizId ? { quizId, force: true } : { force: true };
  const resp = await postJSON(
    `/admin/users/${userId}/report/generate`,
    payload,
  );
  if (!resp || !resp.success)
    throw new Error(resp?.message || "Failed to generate report");
  const fileUrl = resp.data?.url;
  if (!fileUrl) throw new Error("No file URL returned from server");

  // show the freshly generated report in the drawer (do not persist old reports)
  try {
    renderReportLink(resp.data);
  } catch (e) {
    // ignore
  }

  // try direct download
  const student = state.user?.name || "student";
  const quizTitle = state.currentQuiz?.title || "quiz";
  const fileName = `${student}_${quizTitle}_report.pdf`
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "-");

  try {
    const a = document.createElement("a");
    a.href = `${window.location.origin}/view-report.html?url=${encodeURIComponent(fileUrl)}`; // public/raw URL
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    // fallback
    window.open(fileUrl, "_blank");
  }

  return fileUrl;
}

function wireFooterActions() {
  const downloadBtn = document.getElementById("quiz-download-btn");
  const whatsappBtn = document.getElementById("quiz-whatsapp-btn");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadBtn.disabled = true;
      downloadBtn.textContent = "Downloading...";
      downloadQuizReport()
        .then(() => {
          showToast("Report downloaded successfully.", "success");
        })
        .catch((err) => {
          console.error("Failed to download report:", err);
          showToast("Could not download report.", "error");
        })
        .finally(() => {
          downloadBtn.disabled = false;
          downloadBtn.textContent = "Download Report";
        });
    });
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", async () => {
      if (!state.user) return;
      const phoneRaw = state.user?.parentNumber;
      if (!phoneRaw) {
        showToast(
          "No parent WhatsApp number available for this student.",
          "warning",
        );
        return;
      }

      whatsappBtn.disabled = true;
      whatsappBtn.textContent = "Sending...";

      try {
        // Always generate a fresh report before sending
        const userId = state.user._id;
        const quizId = getCurrentQuizId();
        if (!quizId) {
          showToast("Open a quiz first to send its report.", "warning");
          return;
        }
        const payload = { quizId, force: true };
        const gen = await postJSON(
          `/admin/users/${userId}/report/generate`,
          payload,
        );

        if (!gen || !gen.success)
          throw new Error(gen?.message || "Could not generate report");

        // gen.data contains the new report
        const report = gen.data; // <--- store it here

        renderReportLink(report);

        // Use report._id for your short URL redirect
        const pageUrl = `${window.location.origin}/r/${report._id}`;

        const message = `Hello 👋 ${state.user?.name || "there"}\n\nPlease find the quiz report here:\n${pageUrl}`;
        const url = `https://wa.me/2${phoneRaw}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        showToast("WhatsApp opened with report link.", "info");
      } catch (err) {
        console.error("Failed to send WhatsApp message:", err);
        showToast(err.message || "Could not send report.", "error");
      } finally {
        whatsappBtn.disabled = false;
        whatsappBtn.textContent = "Send to Parent";
      }
    });
  }

  // Regen removed: Download always generates a fresh report
}

document.addEventListener("DOMContentLoaded", () => {
  attachDrawerEvents();
  attachQuizEvents();
  attachProfileActions();
  wireFooterActions();
  loadUser();
});
