import { getJSON, putJSON, apiFetch, deleteJSON } from "./app.js";

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function mkOption(value, selectedText) {
  return `<option value="${value}" ${
    selectedText ? "selected" : ""
  }>${value}</option>`;
}

async function loadQuiz() {
  const id = getParam("id");
  if (!id) return (location.href = "/manage-quizzes.html");

  try {
    const res = await getJSON(`/admin/quizzes/${id}`);
    const q = res.data;
    document.querySelector("input[placeholder*='Algebra Basics']").value =
      q.title || "";
    const gradeSelects = document.querySelectorAll("select");
    gradeSelects.forEach((s) => {
      const grades = ["5", "6", "7", "8", "9"];
      s.innerHTML = grades
        .map(
          (val) =>
            `<option value='${val}' ${
              val === q.grade ? "selected" : ""
            }>Grade ${val}</option>`
        )
        .join("");
    });

    renderExistingQuestions(q.questions || [], id);
  } catch (err) {
    console.error(err);
    if (err.status === 401) location.href = "/sign-in.html";
    alert(err.message || err.payload?.message || "Failed to load quiz");
  }
}

function renderExistingQuestions(questions, quizId) {
  const container = document.getElementById("existing-questions");
  if (!container) return;
  container.innerHTML = "";

  questions.forEach((qq, idx) => {
    const div = document.createElement("div");
    div.className =
      "rounded-lg p-4 bg-white dark:bg-[#111722] border border-slate-200 dark:border-[#324467]";

    const optsHtml = (qq.options || [])
      .map(
        (o, i) => `
      <div class="mb-2 flex items-center gap-2">
        <input data-qidx="${idx}" data-oid="${i}" class="opt-input w-full p-2 rounded" value="${o}" />
      </div>`
      )
      .join("");

    div.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div>
          <div class="text-sm font-bold">Question ${idx + 1}</div>
          <textarea class="question-text w-full mt-2 p-2 rounded">${
            qq.question
          }</textarea>
        </div>
        <div class="ml-4 flex flex-col gap-2">
          <button data-qid="${
            qq._id
          }" class="update-q-btn px-3 py-1 rounded bg-primary text-white">Update</button>
          <button data-qid="${
            qq._id
          }" class="delete-q-btn px-3 py-1 rounded bg-red-100 text-red-600">Delete</button>
        </div>
      </div>
      <div class="mb-3">
        <label class="text-xs text-slate-500">Options</label>
        ${optsHtml}
      </div>
      <div class="flex items-center gap-3">
        <label class="text-sm text-slate-500">Correct answer</label>
        <select class="correct-select">
          <option value="0">A</option>
          <option value="1">B</option>
          <option value="2">C</option>
          <option value="3">D</option>
        </select>
        <input type="file" class="image-input" />
      </div>
    `;

    // set correct select (backend stores answers as letters A-D; convert to numeric index for the select)
    const correctSelect = div.querySelector(".correct-select");
    try {
      let ans = qq.answer;
      if (typeof ans === "string" && /^[A-Da-d]$/.test(ans))
        ans = String(ans.toUpperCase().charCodeAt(0) - 65);
      if (ans === undefined || ans === null || ans === "") ans = "0";
      correctSelect.value = String(ans);
    } catch (e) {
      correctSelect.value = "0";
    }

    // update button
    div.querySelectorAll(".update-q-btn").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const qid = btn.dataset.qid;
        const question = div.querySelector(".question-text").value;
        const optionEls = div.querySelectorAll(".opt-input");
        const options = Array.from(optionEls).map((i) => i.value);
        const answer = Number(div.querySelector(".correct-select").value);
        const file = div.querySelector(".image-input")?.files?.[0];

        try {
          if (file) {
            const fd = new FormData();
            if (question) fd.append("question", question);
            fd.append("options", JSON.stringify(options));
            fd.append("answer", String(answer));
            fd.append("image", file);
            await apiFetch(`/admin/quizzes/${quizId}/questions/${qid}`, {
              method: "PUT",
              body: fd,
            });
          } else {
            await putJSON(`/admin/quizzes/${quizId}/questions/${qid}`, {
              question,
              options,
              answer,
            });
          }
          alert("Question updated");
          loadQuiz();
        } catch (err) {
          console.error(err);
          alert(err.message || err.payload?.message || "Update failed");
        }
      })
    );

    // delete button
    div.querySelectorAll(".delete-q-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const confirmed = await createConfirmationPrompt("Delete this question?");
        if (!confirmed) return;
        try {
          await deleteJSON(
            `/admin/quizzes/${quizId}/questions/${btn.dataset.qid}`
          );
          alert("Deleted");
          loadQuiz();
        } catch (err) {
          console.error(err);
          alert("Delete failed");
        }
      })
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
  const qText = document.getElementById("new-question-text")?.value || "";
  const options = [
    document.getElementById("opt-a")?.value || "",
    document.getElementById("opt-b")?.value || "",
    document.getElementById("opt-c")?.value || "",
    document.getElementById("opt-d")?.value || "",
  ];
  const answer = Number(document.getElementById("new-answer")?.value || 0);
  const image = document.getElementById("new-image")?.files?.[0];

  const questions = [{ question: qText, options, answer }];

  const fd = new FormData();
  fd.append("questions", JSON.stringify(questions));
  if (image) fd.append("image0", image);

  try {
    await apiFetch(`/admin/quizzes/${quizId}/questions/add`, {
      method: "PUT",
      body: fd,
    });
    alert("Question added");
    // clear inputs
    document.getElementById("new-question-text").value = "";
    ["opt-a", "opt-b", "opt-c", "opt-d"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
    loadQuiz();
  } catch (err) {
    console.error(err);
    alert(err.message || err.payload?.message || "Add failed");
  }
}

async function saveMeta() {
  const quizId = getParam("id");
  const title = document.querySelector(
    "input[placeholder*='Algebra Basics']"
  )?.value;
  const grade = document.querySelector("select")?.value;
  try {
    await putJSON(`/admin/quizzes/${quizId}`, { title, grade });
    alert("Saved");
    loadQuiz();
  } catch (err) {
    console.error(err);
    alert(err.message || err.payload?.message || "Save failed");
  }
}

function wire() {
  document
    .getElementById("add-question-btn")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      addQuestion();
    });
  document
    .getElementById("save-quiz-changes")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      saveMeta();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuiz();
  wire();
});
