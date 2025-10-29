let helper = document.querySelector(".helper");

window.onload = function () {
  setTimeout(function () {
    helper.style.cssText =
      "transform: translateX(0px); visibility: visible; opacity: 1; display: flex; align-items: center; justify-content: center";
    setTimeout(() => {
      showText();
      helper.querySelector("img").onclick = function () {
        showText();
      };
    }, 1000);
  }, 3000);
};

let isShowingText = false;

function showText() {
  if (isShowingText) return;
  isShowingText = true;
  let helperText = helper.querySelector(".helper-text");
  if (!helperText) {
    let text = addText();
    setTimeout(() => {
      text.style.transform = "scale(1)";
      isShowingText = false;
      setTimeout(() => {
        text.style.transform = "scale(0)";
        setTimeout(() => {
          text.remove();
        }, 1000);
      }, 15000);
    }, 10);
  } else if (helperText) {
    setTimeout(() => {
      helperText.style.transform = "scale(0)";
      isShowingText = true;
      setTimeout(() => {
        helperText.remove();
        let text = addText();
        setTimeout(() => {
          text.style.transform = "scale(1)";
          setTimeout(() => {
            isShowingText = false;
          }, 1100);
          setTimeout(() => {
            text.style.transform = "scale(0)";
            setTimeout(() => {
              text.remove();
            }, 1000);
          }, 15000);
        }, 10);
      }, 1000);
    }, 10);
  }
}

function* helperTextGenerator() {
  if (location.href.includes("landing")) {
    yield `👋 Hi there! I'm Hamada, your fun AI buddy 🤖  
Need anything? Just click me! 🖱️`;
    yield `🏡 This is the Home Page — from here, you can jump to quizzes 🧠, explore your groups 👨‍👩‍👧‍👦, or log out 🚪  
🎯 To go back to where we started anytime, click the logo at the top-left corner 🔙`;
  }
  if (location.href.includes("grades-quizzez")) {
    yield `🧠 Time to test your brain power!  
Please choose your quiz 📚 to start the questions 🎉`;
  }
  if (location.href.includes("grades-groups")) {
    yield `🧮 Welcome to the Groups Zone of MathFalta!
Here you can take a look at all the groups and their math squads 🏫 — each one filled with bright learners just like you!`;
    yield `👀 This page is for viewing only, so you can see which grade you belong to and check out other groups too.`;
    yield `Keep solving, keep smiling, and remember — every number counts! ✨`;
  }
  if (location.href.includes("leaderboard")) {
    yield `🌟 Here you’ll find the top math stars from every grade — students who solved quizzes, earned points, and climbed their way to the top!`;
    yield `📊 Click on a student’s name to see the quizzes they’ve completed and how they scored.`;
    yield `💪 Keep practicing, and your name might shine here next! Every correct answer brings you closer to the Math Master medal! 🥇`;
  }
  if (location.href.includes("profile")) {
    yield `🎯 Here you can view your personal math journey — your grade, quizzes solved, and total score!`;
    yield `🧮 Each quiz you finish adds to your total points, helping you grow from a Math Explorer to a Math Champion!`;
    yield `🌟 Keep challenging yourself, and watch your progress shine brighter every day!`;
  }
  if (location.href.includes("quiz-review")) {
    yield `✨ Great job completing your quiz!
Here, you can review all your answers, see what you got right ✅ and where you can improve 💡.`;
    yield `🔍 Each question helps you understand math better — learning from mistakes is how you become a true Math Master!`;
    yield `🌈 Keep practicing, keep shining, and remember — every mistake is just a step toward success!`;
  }
}

let iterator = helperTextGenerator();
function addText() {
  let text = document.createElement("div");
  let thisText = iterator.next();
  if (thisText.done) {
    iterator = helperTextGenerator();
    thisText = iterator.next();
  }
  text.textContent = thisText.value;
  text.className = "helper-text";
  helper.append(text);
  text.style.cssText = `background-color: ${
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "#2c2c2c"
      : "#f3eaff"
  }; max-width: 300px; margin-left: 20px; padding: 20px; border-radius: 20px; transition: all 1s ease-out; overflow-y: auto; margin-bottom: 20px;`;
  text.style.transform = "scale(0)";
  return text;
}
