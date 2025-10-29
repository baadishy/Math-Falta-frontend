let theUser;
let theQuiz;
let questions;

window.onload = async function () {
  await getUser();
  setReview();
};

async function getUser() {
  theUser = (
    await (
      await fetch(
        `https://math-falta.free.nf/api.php?endpoint=user&id=${localStorage.theUserId}`
      )
    ).json()
  ).data;
  theQuiz = theUser.quizzes.reduce((acc, current) => {
    return acc.topic === localStorage["quiz-type"] ? acc : current;
  });
  questions = theQuiz.doneQuizzes;
}

function setReview() {
  document.querySelector(
    "#score"
  ).textContent = `${theQuiz.score} / ${questions.length}`;

  questions.forEach((ques, i) => {
    reviewQuestion(ques, i);
  });

  document.querySelector(".topic").textContent = theQuiz.topic;
}

function reviewQuestion(ques, i) {
  // let questionContainer = document.createElement('div')
  // let questionElement = document.createElement('div')
  // let answerContainer = document.createElement('div')
  // let answerElement = document.createElement('span')
  let { question, userAnswer, answer, isCorrect } = ques;

  document.querySelector(
    ".review-list"
  ).innerHTML += `<div class="review-question">
          <div class="question">${i + 1}. ${question}</div>
          <div class="answer">
            Your answer: <span class="${isCorrect ? "correct" : "incorrect"}">${
    userAnswer || "No answer"
  }</span>
            <span class="result">${
              isCorrect ? "✔️ Correct" : "❌ Incorrect"
            }</span>
            <div class="correct-answer">Correct answer: <strong>${answer}</strong></div>
          </div>
        </div>
        <hr>
      `;
}
