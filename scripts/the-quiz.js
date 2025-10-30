let part = sessionStorage.part || 0;
let score = sessionStorage.score || 0;
let doneQuizzes =
  sessionStorage.doneQuizzes === "undefined" ||
  sessionStorage.doneQuizzes === undefined ||
  !sessionStorage.doneQuizzes
    ? []
    : JSON.parse(sessionStorage.doneQuizzes);
let filteredQuizzes = [];
async function getQuiz() {
  const quiz = (
    await (
      await fetch(
        `https://math-falta.vercel.app/api/quizzes?grade=${localStorage.grade
          .split("-")
          .pop()}&topic=${encodeURIComponent(localStorage["quiz-type"])}`
      )
    ).json()
  ).data;
  // let [
  //   grade5Quizzes,
  //   grade6Quizzes,
  //   grade7Quizzes,
  //   grade8Quizzes,
  //   grade9Quizzes,
  //   grade10Quizzes,
  //   grade11Quizzes,
  // ] = quizzes;
  // let gradeQuizzes =
  //   localStorage.grade === "grade-5"
  //     ? grade5Quizzes
  //     : localStorage.grade === "grade-6"
  //     ? grade6Quizzes
  //     : localStorage.grade === "grade-7"
  //     ? grade7Quizzes
  //     : localStorage.grade === "grade-8"
  //     ? grade8Quizzes
  //     : localStorage.grade === "grade-9"
  //     ? grade9Quizzes
  //     : localStorage.grade === "grade-10"
  //     ? grade10Quizzes
  //     : grade11Quizzes;
  // filteredQuizzes = gradeQuizzes.filter((quiz) => {
  //   return quiz.topic === localStorage["quiz-type"];
  // });
  filteredQuizzes = quiz;
  if (part <= filteredQuizzes.length - 1) showQuestion();
  else showFinal();
  return filteredQuizzes;
}

window.onload = async function () {
  localStorage.removeItem("theAnswer");
  await getQuiz();
};

document.querySelector(".links a").href = `./${localStorage.grade}.html`;

document.querySelectorAll(".links a").forEach((option) => {
  option.onclick = function () {
    sessionStorage.removeItem("doneQuizzes");
    sessionStorage.removeItem("part");
    sessionStorage.removeItem("score");
  };
});

let theQuestionPart = document.querySelector(".question strong");
let theChoicesPart = document.querySelector(".choices");

function showQuestion() {
  theQuestionPart.textContent = filteredQuizzes[part].question;
  theChoicesPart.querySelector("button:nth-child(1)").textContent =
    filteredQuizzes[part].options[0];
  theChoicesPart.querySelector("button:nth-child(2)").textContent =
    filteredQuizzes[part].options[1];
  theChoicesPart.querySelector("button:nth-child(3)").textContent =
    filteredQuizzes[part].options[2];
  theChoicesPart.querySelector("button:nth-child(4)").textContent =
    filteredQuizzes[part].options[3];
}
function changeQuestion() {
  document.querySelector(".question-block").style.cssText =
    "transform: translatex(-250%); transition: transform 1s ease-out;";
  setTimeout(() => {
    showQuestion();
    document.querySelector(".question-block").style.cssText =
      "transform: translatex(0);transition: all 1s ease-out;";
    if (document.querySelector(".correct")) {
      document.querySelector(".correct").classList.remove("correct");
    }
    if (document.querySelector(".incorrect")) {
      document.querySelector(".incorrect").classList.remove("incorrect");
    }
    document.querySelectorAll(".choice").forEach((option) => {
      option.classList.remove("choosen");
      option.style.pointerEvents = "all";
    });
  }, 1000);
}
async function showFinal() {
  let theQuizzes = {
    topic: localStorage.getItem("quiz-type"),
    score: score,
    doneQuizzes: JSON.parse(sessionStorage.doneQuizzes),
  };
  let theUser = (
    await (
      await fetch(
        `https://math-falta.vercel.app/api/user/${localStorage.theUserId}`
      )
    ).json()
  ).data;

  document.querySelector(".question-block").style.cssText =
    "transform: translatex(-250%);transition: all 1s ease-out;";
  setTimeout(function () {
    document.querySelector(".question-block").innerHTML = `
      <h2>Quiz Finished!</h2>
      <p>Your score: <strong>${theQuizzes.score} / ${doneQuizzes.length}</strong></p>
      `;
    document.querySelector(".question-block").style.cssText =
      "transform: translatex(0);transition: all 1s ease-out;";
  }, 1000);
  if (theUser.quizzes) {
    if (theUser.quizzes.some((quiz) => quiz.topic === theQuizzes.topic)) return;
  }
  // theUser.quizzes.push(theQuizzes);
  let res = await fetch(
    `https://math-falta.vercel.app/api/user/${localStorage.theUserId}/doneQuiz`,
    {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(theQuizzes),
    }
  );
  console.log(await res.json());
}
function saveQuestion(correct) {
  let theQuestion = filteredQuizzes[part];
  theQuestion.isCorrect = correct;
  theQuestion.userAnswer = localStorage.theAnswer;
  console.log(doneQuizzes);
  if (doneQuizzes.some((question) => question.id === theQuestion.id)) return;
  doneQuizzes.push(theQuestion);
  sessionStorage.setItem("doneQuizzes", JSON.stringify(doneQuizzes));
}

// document.addEventListener('keyup',function(event) {
//   if (event.key === 'Enter') {
//     document.querySelector('.next-btn').click()
//   }
// })

document.querySelectorAll(".choice").forEach((option) => {
  option.onclick = function (event) {
    document.querySelectorAll(".choice").forEach((option) => {
      option.classList.remove("choosen");
    });
    option.classList.add("choosen");
    localStorage.setItem("theAnswer", event.target.textContent);
  };
});

document.querySelector(".next-btn").onclick = function () {
  if (localStorage.theAnswer) {
    if (localStorage.theAnswer === filteredQuizzes[part].answer) {
      document.querySelector(".choosen").classList.add("correct");
      score++;
      sessionStorage.score = score;
      saveQuestion(true);
    } else {
      document.querySelector(".choosen").classList.add("incorrect");
      document.querySelectorAll(".choice").forEach((option) => {
        if (option.textContent === filteredQuizzes[part].answer) {
          option.classList.add("correct");
        }
      });
      saveQuestion(false);
    }
    localStorage.removeItem("theAnswer");
    setTimeout(function () {
      if (part === filteredQuizzes.length - 1) {
        showFinal();
        sessionStorage.part = filteredQuizzes.length;
        return;
      }
      part++;
      sessionStorage.part = part;
      changeQuestion();
    }, 1500);
    document.querySelectorAll(".choice").forEach((option) => {
      option.style.pointerEvents = "none";
    });
  } else {
    alert("Please Choose An Answer");
  }
};
