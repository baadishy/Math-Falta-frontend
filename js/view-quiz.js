import { getJSON } from "./app.js";

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

async function loadQuizDetails() {
  const quizId = getParam("id");
  if (!quizId) {
    document.getElementById("quiz-details-container").innerHTML =
      "<p class='text-center text-red-500'>Quiz ID not found.</p>";
    return;
  }

  try {
    const res = await getJSON(`/quizzes/${quizId}`);
    const quiz = res.data;

    if (!quiz) {
      document.getElementById("quiz-details-container").innerHTML =
        "<p class='text-center text-red-500'>Quiz not found.</p>";
      return;
    }

    document.getElementById("quiz-title").textContent = quiz.title;
    document.getElementById("quiz-grade").textContent = `Grade ${quiz.grade}`;
    document.getElementById("quiz-questions-count").textContent = `${quiz.questions.length} Questions`;

    const questionsContainer = document.getElementById("quiz-questions-container");
    questionsContainer.innerHTML = "";

    quiz.questions.forEach((q, index) => {
      const questionCard = document.createElement("div");
      questionCard.className = "bg-white dark:bg-[#192233] rounded-lg shadow-sm border border-slate-200 dark:border-[#232f48] p-6 mb-4";
      questionCard.innerHTML = `
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Question ${index + 1}: ${q.question}</h3>
        ${q.imageUrl ? `<img src="${q.imageUrl}" alt="Question Image" class="mb-4 rounded-lg max-w-full h-auto">` : ''}
        <div class="space-y-2">
          ${q.options.map((option, optIndex) => `
            <div class="flex items-center p-3 rounded-md border ${optIndex === q.answer ? 'border-green-500 bg-green-50 dark: