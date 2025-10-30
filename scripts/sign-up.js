"use strict";
let form = document.forms[0];
let username = form.username;
let email = form.email;
let password = form.password;
let parentNumber = form["parent-number"];
let grade = form.grade;
let invalid = document.createElement("span");
invalid.append(document.createTextNode("This is invalid"));
invalid.style.cssText = "color: red;";

window.onload = function () {
  username.focus();
};
function checkInputValidity() {
  function checkValidation(element) {
    element.scrollIntoView({ block: "center" });
    if (element === username) {
      if (element.value !== "" && element.value.length > 3) {
        invalid.remove();
        return true;
      } else {
        element.after(invalid);
        return false;
      }
    } else if (element === email) {
      if (element.value.includes(".com")) {
        invalid.remove();
        return true;
      } else {
        element.after(invalid);
        return false;
      }
    } else if (element === parentNumber) {
      if (element.value.length === 11) {
        invalid.remove();
        return true;
      } else {
        return false;
      }
    } else if (element === password) {
      if (element.value.length > 7) {
        invalid.remove();
        return true;
      } else {
        element.after(invalid);
        return false;
      }
    }
  }
  [username, email, password, parentNumber].forEach(function (element) {
    element.onkeyup = function (event) {
      checkValidation(element);
    };
  });
}

checkInputValidity();

function createPopUp() {
  let style = document.createElement("style");
  style.textContent = `
  .message div {
    position: relative;
  }
  /* Animated border circle */
  .message div span {
    width: 70px;
    height: 70px;
    border: 4px solid green;
    border-radius: 50%;
    display: block;
    margin: auto;
    position: relative;
    z-index: 0;
    transform: scaley(0);
    opacity: 0;
    animation: drawCircle 0.4s ease-out forwards;
    transform-origin: bottom;
  }
  
  @keyframes drawCircle {
    to {
      transform: scaley(1);
      opacity: 1;
    }
  }
  
  /* Checkmark lines */
  .message div span::before,
  .message div span::after {
    content: '';
    position: absolute;
    background-color: lightgreen;
    border-radius: 7px;
    opacity: 0;
    z-index: 1;
  }
  
  /* Short stroke */
  .message div span::before {
    width: 8px;
    height: 25px;
    top: 35px;
    left: 7px;
    transform: rotate(-45deg) scaleY(0);
    transform-origin: top;
    animation: drawBefore 0.3s ease-out forwards 0.5s;
  }
  
  /* Long stroke */
  .message div span::after {
    width: 8px;
    height: 45px;
    top: 7px;
    left: 20px;
    transform: rotate(45deg) scaleY(0);
    transform-origin: bottom;
    animation: drawAfter 0.4s ease-out forwards 0.8s;
  }
  
  /* Animation for short stroke */
  @keyframes drawBefore {
    to {
      transform: rotate(-45deg) scaleY(1);
      opacity: 1;
    }
  }
  
  /* Animation for long stroke */
  @keyframes drawAfter {
    to {
      transform: rotate(45deg) scaleY(1);
      opacity: 1;
    }
  }
  
  .message-text {
    opacity: 0;
    animation: fade-in .3s forwards 1.2s;
    text-align: center;
  }
  
  @keyframes fade-in {
    to {
      opacity: 1
    }
  }
  body {
    position: relative;
    height: 100vh;
    overflow: hidden
  }
  .overlay {
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.6);
    z-index: 9;
    position: fixed;
    top: 0;
    left: 0;
  }
  `;
  document.head.append(style);

  let message = document.createElement("div");
  let rightMark = document.createElement("div");
  let messageText = document.createElement("div");
  let overlay = document.createElement("div");
  overlay.className = "overlay";
  messageText.textContent = `You have successfully signed ${
    location.href.includes("sign-up") ? "up" : "in"
  }`;
  messageText.className = "message-text";
  // Create the circle span
  let circle = document.createElement("span");

  rightMark.append(circle); // Add the circle inside the check container
  rightMark.style.cssText =
    "position: relative; padding: 20px; margin-bottom: 20px;";

  message.className = "message";
  message.style.cssText =
    "border: 2px solid black; background-color: black; color: white; padding: 30px; font-size: 20px; font-family: Arial; max-width: 300px; min-width: 250px; border-radius: 20px; z-index: 10; position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%)";

  message.append(rightMark, messageText);
  document.body.prepend(message);
  message.after(overlay);
  // valid = false;
  // setTimeout(function () {
  //   document.addEventListener("click", function (event) {
  //     message.remove();
  //     overlay.remove();
  //     valid = true;
  //   });
  // }, 2000);
}

function idcreator() {
  let letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
  ];
  let id = "";
  for (let i = 0; i < 15; i++) {
    id += letters[Math.floor(Math.random() * 36)];
  }
  return id;
}

class User {
  constructor() {
    this.username = username.value;
    this.email = email.value;
    this.password = password.value;
    this.grade = grade.value;
    this.parentNumber = parentNumber.value;
    this.id = idcreator();
    this.quizzes = [];
    this.title = "student";
    this.totalScore = 0;
  }
}

async function addUser(newUser) {
  try {
    let res = await fetch("https://math-falta.vercel.app/api/user/sign-up", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(newUser),
    });
    return await res.json();
  } catch (err) {
    alert(err);
  }
}

form.onsubmit = async function (event) {
  event.preventDefault();
  try {
    let user = new User();
    let res = await addUser(user);
    console.log(res.success);
    if (res.success) {
      localStorage.setItem("theUserId", user.id);
      createPopUp();
      setTimeout(function () {
        location.assign("../html/landing.html");
      }, 3000);
    } else {
      alert(res.msg);
    }
  } catch (err) {
    alert(err);
  }
};
