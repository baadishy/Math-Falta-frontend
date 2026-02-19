import { getJSON } from "./app.js";

/* =======================
   Helpers
======================= */
function getParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

function setParam(name, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  history.pushState(null, "", url);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* =======================
   Image Zoom Modal
======================= */
const modal = document.getElementById("image-zoom-modal");
const zoomedImg = document.getElementById("zoomed-image");
const closeBtn = document.getElementById("close-image-modal");

function openImageModal(src) {
  zoomedImg.src = src;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  zoomedImg.src = "";
  document.body.style.overflow = "";
}

modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeImageModal();
});

closeBtn?.addEventListener("click", closeImageModal);

/* =======================
   Summary
======================= */
function renderSummary(data) {
  const summary = document.getElementById("quiz-summary");
  if (!summary) return;

  summary.innerHTML = `
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
      ${data.title}
    </h2>
    <p class="text-slate-500 dark:text-slate-400 text-sm">
      Score:
      <span class="font-semibold text-primary">${data.score}</span>
      / ${data.questions.length}
    </p>
    <p class="text-slate-400 dark:text-slate-500 text-xs">
      Solved at: ${formatDate(data.createdAt)}
    </p>
  `;
}

/* =======================
   Render Questions
======================= */
function renderQuestions(data) {
  const area = document.getElementById("quiz-questions-review");
  if (!area) return;
  area.innerHTML = "";

  data.questions.forEach((q, idx) => {
    const block = document.createElement("div");
    block.className = "flex flex-col gap-4 mb-6";

    /* ===== Question Header ===== */
    const header = document.createElement("div");
    header.className = "flex items-start gap-4";

    const num = document.createElement("div");
    num.className =
      "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center font-bold text-sm";
    num.textContent = idx + 1;

    header.appendChild(num);

    /* ===== Image OR Text ===== */
    if (q.image || q.imageUrl) {
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "w-full flex justify-center";

      const skeleton = document.createElement("div");
      skeleton.className =
        "w-full max-w-xl h-[220px] bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse";

      const img = document.createElement("img");
      img.src = q.image.url || q.imageUrl;
      img.alt = `Question ${idx + 1}`;
      img.className =
        "hidden max-w-full max-h-[350px] object-contain rounded-xl border border-slate-200 dark:border-[#232f48] cursor-zoom-in";

      img.onload = () => {
        skeleton.remove();
        img.classList.remove("hidden");
      };

      img.onclick = () => openImageModal(img.src);

      imgWrapper.appendChild(skeleton);
      imgWrapper.appendChild(img);
      header.appendChild(imgWrapper);
    } else {
      const title = document.createElement("h3");
      title.className = "text-lg font-medium text-slate-900 dark:text-white";
      title.textContent = q.question;
      header.appendChild(title);
    }

    block.appendChild(header);

    /* ===== Options ===== */
    const choices = document.createElement("div");
    choices.className = "grid grid-cols-1 md:grid-cols-2 gap-3 pl-12";

    q.options.forEach((opt, i) => {
      const key = ["A", "B", "C", "D"][i];
      const isCorrect = q.answer === key;
      const isUser = q.userAnswer === key;

      let cls = "p-4 rounded-xl border flex gap-3 items-center";

      if (isCorrect)
        cls += " border-green-500 bg-green-50 dark:bg-green-900/20";
      else if (isUser) cls += " border-red-500 bg-red-50 dark:bg-red-900/20";
      else
        cls +=
          " border-gray-200 dark:border-[#324467] bg-white dark:bg-surface-dark";

      const el = document.createElement("div");
      el.className = cls;
      el.innerHTML = `
        <div class="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
          ${key}
        </div>
        <span>${opt}</span>
      `;

      choices.appendChild(el);
    });

    block.appendChild(choices);
    area.appendChild(block);
  });
}

/* =======================
   Load Quiz
======================= */
async function loadQuiz(id) {
  const res = await getJSON(`/quizzes/answers/${id}`);
  if (!res?.data) return;

  renderSummary(res.data);
  renderQuestions(res.data);
}

/* =======================
   Sidebar
======================= */
let allQuizzes = [];

function renderSidebar(quizzes, activeId) {
  const panel = document.getElementById("quiz-history-list");
  if (!panel) return;
  panel.innerHTML = "";

  quizzes.forEach((quiz) => {
    const el = document.createElement("div");
    el.dataset.id = quiz._id;

    el.className =
      "cursor-pointer p-4 rounded-xl hover:bg-primary/10 transition";

    if (quiz._id === activeId) {
      el.classList.add("border-l-4", "border-primary");
    }

    el.innerHTML = `
      <h4 class="font-semibold">${quiz.title}</h4>
      <p class="text-xs text-slate-500">${formatDate(quiz.createdAt)}</p>
    `;

    el.onclick = async () => {
      setParam("answersId", quiz._id);
      await loadQuiz(quiz._id);
      // Re-render sidebar to update active state, preserving search
      applyFilters();
    };

    panel.appendChild(el);
  });
}

function applyFilters() {
    const searchInput = document.getElementById("quiz-search");
    const searchTerm = searchInput.value.toLowerCase();
    const activeId = getParam("answersId");

    const filteredQuizzes = allQuizzes.filter(q => 
        q.title.toLowerCase().includes(searchTerm)
    );
    
    renderSidebar(filteredQuizzes, activeId);
}


/* =======================
   Init
======================= */
async function init() {
  const searchInput = document.getElementById("quiz-search");
  searchInput.addEventListener('input', applyFilters);

  const res = await getJSON("/quizzes/answers");
  allQuizzes = res.data || [];
  if (!allQuizzes.length) return;

  const activeId = getParam("answersId") || allQuizzes[0]._id;
  setParam("answersId", activeId);

  applyFilters(); // Initial render of sidebar
  await loadQuiz(activeId);
}

document.addEventListener("DOMContentLoaded", init);
