import { apiFetch } from "./app.js";

function collectQuestions() {
  const blocks = document.querySelectorAll(".question-block");
  const questions = Array.from(blocks).map((block) => {
    const qText = block.querySelector("textarea")?.value || "";
    const optionInputs = block.querySelectorAll("input[type='text']");
    const options = Array.from(optionInputs)
      .slice(0, 4)
      .map((i) => i.value || "");
    const radios = block.querySelectorAll("input[type='radio']");
    const checkedIndex = Array.from(radios).findIndex((r) => r.checked);
    const answer = checkedIndex >= 0 ? checkedIndex : 0;
    return { question: qText, options, answer };
  });
  return questions;
}

async function publishQuiz() {
  const titleInput = document.querySelector(
    'input[placeholder*="Linear Algebra"]'
  );
  const selectGrade = document.querySelector("select");

  const title = titleInput?.value?.trim();
  const grade = selectGrade?.value;

  if (!title) return alert("Please provide a title for the quiz");
  if (!grade) return alert("Please select a grade");

  const questions = collectQuestions();
  if (questions.length === 0) return alert("Please add at least one question");

  const fd = new FormData();
  fd.append("title", title);
  fd.append("grade", grade);
  fd.append("questions", JSON.stringify(questions));

  // Attach images if provided
  document.querySelectorAll(".question-block").forEach((block, idx) => {
    const fileInput = block.querySelector("input[type='file']");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      fd.append(`image${idx}`, fileInput.files[0]);
    }
  });

  try {
    await apiFetch("/admin/quizzes", { method: "POST", body: fd });
    alert("Quiz created successfully");
    window.location.href = "/manage-quizzes.html";
  } catch (err) {
    console.error(err);
    alert(err.message || err.payload?.message || "Failed to create quiz");
  }
}

function wirePublish() {
  const btn = document.getElementById("publish-quiz-btn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    publishQuiz();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wirePublish();
});
