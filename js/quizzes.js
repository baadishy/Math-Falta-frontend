import { getJSON } from "./app.js";

let allQuizzes = [];

function renderQuizzes(quizzes) {
  const grid = document.getElementById("quizzes-grid");
  if (!grid) return;

  grid.innerHTML = "";
  if (!quizzes.length) {
    grid.innerHTML = `<div class="col-span-full text-center text-slate-500 dark:text-slate-400 p-6">No quizzes found matching your search.</div>`;
    return;
  }

  quizzes.forEach((q) => {
    const card = document.createElement("div");
    card.className =
      "group bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300";
    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
          <span class="material-symbols-outlined !text-2xl">shapes</span>
        </div>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          ${q.questionsCount} Questions
        </span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">${q.title}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">Practice your ${q.title} skills.</p>
      <a class="flex items-center justify-center w-full py-2.5 bg-slate-50 dark:bg-[#111722] hover:bg-primary dark:hover:bg-primary text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white border border-slate-200 dark:border-[#232f48] hover:border-primary dark:hover:border-primary rounded-lg font-medium transition-all gap-2 group/btn" href="/quiz.html?id=${q._id}">
        Start Quiz
        <span class="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
      </a>
    `;
    grid.appendChild(card);
  });
}

function applyFilters() {
  const searchInput = document.querySelector('input[placeholder="Search topics..."]');
  const searchTerm = searchInput.value.toLowerCase();

  const filteredQuizzes = allQuizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm)
  );

  renderQuizzes(filteredQuizzes);
}

async function initQuizzes() {
  const grid = document.getElementById("quizzes-grid");
  if (!grid) return;

  const searchInput = document.querySelector('input[placeholder="Search topics..."]');
  searchInput.addEventListener('input', applyFilters);

  // show skeleton cards while fetching
  grid.innerHTML = "";
  const skeletons = [];
  for (let i = 0; i < 6; i++) {
    const s = document.createElement("div");
    s.className =
      "rounded-2xl p-6 bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48]";
    s.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="size-12 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse w-12 h-12"></div>
        <span class="inline-block bg-slate-200 dark:bg-slate-700 animate-pulse w-20 h-5 rounded"></span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2"><span class="inline-block bg-slate-200 dark:bg-slate-700 animate-pulse w-40 h-6 rounded"></span></h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6"><span class="inline-block bg-slate-200 dark:bg-slate-700 animate-pulse w-full h-3 rounded"></span></p>
      <div class="w-full"><span class="inline-block bg-slate-200 dark:bg-slate-700 animate-pulse w-full h-10 rounded"></span></div>
    `;
    grid.appendChild(s);
    skeletons.push(s);
  }

  try {
    const res = await getJSON("/quizzes/titles");
    allQuizzes = res.data || [];
    applyFilters(); // Initial render

  } catch (err) {
    console.error("Failed to load quizzes", err);
    if (err.status === 401) window.location.href = "/sign-in.html";
    // remove skeletons on error
    grid.innerHTML = "";
    const errDiv = document.createElement("div");
    errDiv.className = "text-center text-slate-500 dark:text-slate-400 p-6";
    errDiv.textContent = "Could not load quizzes.";
    grid.appendChild(errDiv);
  }
}

document.addEventListener("DOMContentLoaded", initQuizzes);
