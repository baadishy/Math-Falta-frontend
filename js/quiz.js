import { getJSON, postJSON } from "./app.js";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function renderQuestion(q, idx) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col gap-6 mb-6";

  const qNum = document.createElement("div");
  qNum.className = "flex items-start gap-4";

  // If question has an image, show the image instead of text
  if (q.image) {
    qNum.innerHTML = `
    <span class="flex-shrink-0 flex items-center justify-center size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">
      ${idx + 1}
    </span>
    <div class="mt-2 w-full flex justify-center">
      <img 
        src="${q.image.url}" 
        alt="Question Image ${idx + 1}" 
        class="rounded-xl border border-slate-200 dark:border-[#232f48] max-w-full max-h-[400px] object-contain"
      />
    </div>
  `;
  } else {
    // normal question text
    qNum.innerHTML = `
      <span class="flex-shrink-0 flex items-center justify-center size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm">
        ${idx + 1}
      </span>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
        ${q.question}
      </h3>
    `;
  }

  wrapper.appendChild(qNum);

  const optionsGrid = document.createElement("div");
  optionsGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4";

  const optionKeys = ["A", "B", "C", "D"];
  optionKeys.forEach((key, i) => {
    if (!q.options || !q.options[i]) return;
    const label = document.createElement("label");
    label.className =
      "group relative flex cursor-pointer rounded-xl border-2 border-slate-200 dark:border-[#232f48] bg-white dark:bg-[#192233] p-4 hover:border-primary dark:hover:border-primary transition-all";
    label.innerHTML = `
      <input class="sr-only peer" name="quiz-option-${idx}" type="radio" value="${key}" />
      <div class="flex w-full items-center gap-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white group-hover:border-primary dark:group-hover:border-primary transition-colors">
          <span class="text-sm font-bold">${key}</span>
        </div>
        <div class="flex-1"><p class="font-medium text-slate-900 dark:text-white">${q.options[i]}</p></div>
        <div class="hidden peer-checked:block text-primary"><span class="material-symbols-outlined">check_circle</span></div>
      </div>
      <div class="absolute inset-0 rounded-xl border-2 border-primary opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
    `;
    optionsGrid.appendChild(label);
  });

  wrapper.appendChild(optionsGrid);
  return wrapper;
}

async function initQuiz() {
  const id = getQueryParam("id");
  if (!id) return alert("Quiz id is required");

  // show skeletons while loading
  const heading = document.getElementById("quiz-heading");
  const title = document.getElementById("quiz-title");
  const desc = document.getElementById("quiz-description");
  const container = document.getElementById("quiz-container");
  const submitBtn = document.getElementById("submit-quiz-btn");

  if (heading)
    heading.innerHTML = `<span class="inline-block w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span>`;
  if (title)
    title.innerHTML = `<span class="inline-block w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span>`;
  if (desc)
    desc.innerHTML = `<span class="inline-block w-full h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span>`;
  if (container) {
    container.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("div");
      s.className = "mb-6 animate-pulse";
      s.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
          <div class="w-full">
            <div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 mb-2 rounded"></div>
            <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      `;
      container.appendChild(s);
    }
  }
  if (submitBtn) submitBtn.setAttribute("disabled", "disabled");

  try {
    const res = await getJSON(`/quizzes/${id}`);
    const quiz = res.data;

    if (heading) heading.textContent = quiz.title;
    if (title) title.textContent = quiz.title;
    if (desc) desc.textContent = quiz.description || "";

    container.innerHTML = "";
    quiz.questions.forEach((q, idx) => {
      container.appendChild(renderQuestion(q, idx));
    });

    if (submitBtn) {
      submitBtn.removeAttribute("disabled");
      submitBtn.addEventListener("click", async () => {
        const questions = quiz.questions.map((q, idx) => {
          const sel = document.querySelector(
            `input[name="quiz-option-${idx}"]:checked`
          );
          return { questionId: q._id, userAnswer: sel ? sel.value : "" };
        });

        try {
          const postRes = await postJSON("/quizzes/answers", {
            quizId: id,
            questions,
          });
          const created = postRes.data;
          if (created && created._id) {
            window.location.href = `/quiz-result.html?answersId=${created._id}`;
          } else {
            alert("Submitted");
          }
        } catch (err) {
          alert(err.payload?.msg || err.message || "Submission failed");
        }
      });
    }
  } catch (err) {
    console.error(err);
    if (err.status === 401) window.location.href = "/sign-in.html";
    else alert(err.payload?.msg || err.message || "Could not load quiz");
  }
}

document.addEventListener("DOMContentLoaded", initQuiz);
