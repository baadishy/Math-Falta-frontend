async function getQuizzes() {
  try {
    const quizzes = (
      await (
        await fetch(
          `https://math-falta.vercel.app/api/topics?grade=${
            location.pathname.split("/").pop().split(".")[0].split("-")[1]
          }`
        )
      ).json()
    ).data;
    return quizzes;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
  }
}

async function filterQuizzes() {
  try {
    putOptions(await getQuizzes());
  } catch (error) {
    console.error("Error filtering quizzes:", error);
  }
}

function putOptions(filteredQuizzes) {
  try {
    filteredQuizzes.forEach((topic) => {
      let element = document.createElement("li");
      let text = document.createElement("a");
      text.textContent = topic;
      element.append(text);
      document.querySelector(".container ul").append(element);
    });
  } catch (error) {
    console.error("Error putting quiz options:", error);
  }
}

async function chooseQuiz() {
  try {
    await filterQuizzes();
    document.querySelectorAll("ul li").forEach((element) => {
      element.onclick = function () {
        localStorage.setItem(
          "quiz-type",
          element.querySelector("a").textContent
        );
        localStorage.setItem(
          "grade",
          `${location.pathname.split("/").pop().split(".")[0]}`
        );
        location.href = "./the-quizz.html";
      };
    });
  } catch (error) {
    console.error("Error choosing quiz:", error);
  }
}
// chooseQuiz();

async function checkQuizzes() {
  try {
    let theUser = (
      await (
        await fetch(
          `https://math-falta.vercel.app/api/user/${localStorage.getItem(
            "theUserId"
          )}`
        )
      ).json()
    ).data;

    if (theUser) {
      let link = document.querySelector(".links a");
      if (link) link.remove();
    }

    let options = document.querySelectorAll("ul li");

    for (let i = 0; i < theUser.quizzes.length; i++) {
      options.forEach(function (option) {
        if (option.textContent === theUser.quizzes[i].topic) {
          option.style.cssText =
            "pointer-events: none; cursor: not-allowed; opacity: 0.6";
        }
      });
    }
  } catch (error) {
    console.error("Error checking quizzes:", error);
  }
}
// checkQuizzes();

window.onload = async function () {
  try {
    await chooseQuiz();
    await checkQuizzes();
  } catch (error) {
    console.error("Error during window load:", error);
  }
};
