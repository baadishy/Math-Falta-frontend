// let theUser = Object.assign({totalScore: function() {
//   return this.quizzes.reduce((acc,current) => acc + current.score, 0)
// }}, JSON.parse(localStorage.getItem("theUser")));
let fields = document.getElementsByClassName("value");

async function showInfo() {
  let theUser = (
    await (
      await fetch(
        `https://math-falta.vercel.app/api/user/${localStorage.theUserId}`
      )
    ).json()
  ).data;
  fields[0].textContent = theUser.username;
  fields[1].textContent = theUser.grade;
  fields[2].textContent = theUser.parentNumber;
  fields[3].textContent = theUser.email;
  fields[4].textContent = theUser.totalScore;
}

showInfo();
let quizzesPart = document.querySelector(".quizzes ul");

async function showQuizzes() {
  let theUser = (
    await (
      await fetch(
        `https://math-falta.vercel.app/api/user/${localStorage.theUserId}`
      )
    ).json()
  ).data;
  if (theUser.quizzes.length) {
    theUser.quizzes.forEach((quiz) => {
      putQuiz(quiz);
    });
  } else {
    quizzesPart.append(document.createElement("li"));
    quizzesPart.querySelector("li").textContent = "No Quizzes";
    quizzesPart.querySelector("li").style.pointerEvents = "none";
    quizzesPart.querySelector("li").style.color = "gray";
  }
}
showQuizzes();

function putQuiz(quiz) {
  let li = document.createElement("li");
  li.textContent = quiz.topic;
  quizzesPart.append(li);
  li.onclick = function () {
    location.href = "../html/quiz-review.html";
    localStorage.setItem("quiz-type", this.textContent);
  };
}
