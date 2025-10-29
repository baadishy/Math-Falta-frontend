let type = location.pathname.split("/").pop().split(".")[0].split("-")[1];
if (type.includes("user")) {
  ("use strict");
  let form = document.forms[0];
  let username = form.username;
  let email = form.email;
  let password = form.password;
  let parentNumber = form["parentPhone"];
  let grade = form.grade;
  let invalid = document.createElement("span");
  invalid.append(document.createTextNode("This is invalid"));
  invalid.style.cssText = "color: red;";
  let users = [
    {
      username: "felemonfawzy@admin.com",
      title: "admin",
      password: "theAdminFelemonFawzy",
    },
  ];
  if (localStorage.users !== "undefined" && localStorage.users !== undefined)
    users = JSON.parse(localStorage.users);
  localStorage.setItem("users", JSON.stringify(users));

  window.onload = function () {
    username.focus();
  };
  function checkInputValidity(work) {
    if (!work) return;
    function checkValidation(element) {
      element.scrollIntoView({ block: "center" });
      if (element === username) {
        if (element.value !== "" && element.value.length > 3) {
          console.log("username done");
          invalid.remove();
          return true;
        } else {
          element.after(invalid);
          return false;
        }
      } else if (element === email) {
        if (element.value.includes(".com")) {
          console.log("email done");
          invalid.remove();
          return true;
        } else {
          element.after(invalid);
          return false;
        }
      } else if (element === parentNumber) {
        if (element.value.length === 11) {
          console.log("phone done");
          invalid.remove();
          return true;
        } else {
          return false;
        }
      } else if (element === password) {
        if (element.value.length > 7) {
          console.log("password done");
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
      // element.onblur = function () {
      //   if (!checkValidation(element)) {
      //     element.focus();
      //   }
      // };
    });
  }

  checkInputValidity(true);

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
    messageText.textContent = `New User Added Successfully;`;
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
  function checkUser() {
    let theUser = users.filter(function (user) {
      return (
        username.value === user.username ||
        password.value === user.password ||
        email.value === user.email
      );
    });
    if (theUser.length === 0) return true;
    else return false;
  }
  form.onsubmit = function (event) {
    if (checkUser()) {
      let user = {
        username: username.value,
        email: email.value,
        password: password.value,
        parentNumber: parentNumber.value,
        grade: grade.value,
        id: idcreator(),
        quizzes: [],
        totalScore: function () {
          this.quizzes.reduce((acc, current) => acc.score + current.score);
        },
        title: "student",
      };
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
      event.preventDefault();
      createPopUp();
      setTimeout(function () {
        // document.querySelector('.message').remove()
        // document.querySelector('.overlay').remove()
        // form.querySelectorAll('input').forEach(input => {
        //   input.value = ''
        // })
        history.back();
      }, 3000);
    } else {
      console.log(checkUser());
      event.preventDefault();
      alert("username or password are already taken");
    }
  };
} else if (type.includes("quiz")) {
  let form = document.querySelector("form");
  let topic = form["quiz-topic"];
  let grade = form.grade;
  let question = form.question;
  let choice1 = form.choice1;
  let choice2 = form.choice2;
  let choice3 = form.choice3;
  let choice4 = form.choice4;
  let correctAnswer = form["correct-answer"];
  let quizzes = [
    [
      // 🟦 Whole Numbers
      {
        id: 1,
        grade: 5,
        topic: "Whole Numbers",
        question: "Write the number 7,305 in words.",
        options: [
          "Seven thousand fifty-three",
          "Seven thousand three hundred five",
          "Seven hundred three thousand five",
          "Seventy-three thousand five",
        ],
        answer: "Seven thousand three hundred five",
      },
      {
        id: 2,
        grade: 5,
        topic: "Whole Numbers",
        question: "The value of digit 6 in 46,528 is:",
        options: ["6", "60", "600", "6,000"],
        answer: "6,000",
      },
      {
        id: 3,
        grade: 5,
        topic: "Whole Numbers",
        question: "Round 4,768 to the nearest hundred.",
        options: ["4,700", "4,800", "4,760", "4,770"],
        answer: "4,800",
      },
      {
        id: 4,
        grade: 5,
        topic: "Whole Numbers",
        question: "The predecessor of 10,000 is:",
        options: ["9,000", "9,999", "10,001", "99,999"],
        answer: "9,999",
      },
      {
        id: 5,
        grade: 5,
        topic: "Whole Numbers",
        question: "Round 7,684 to the nearest thousand.",
        options: ["7,000", "7,700", "8,000", "7,600"],
        answer: "8,000",
      },

      // 🟦 Fractions & Decimals
      {
        id: 6,
        grade: 5,
        topic: "Fractions & Decimals",
        question: "Simplify the fraction 18/24.",
        options: ["2/3", "3/4", "4/6", "5/8"],
        answer: "3/4",
      },
      {
        id: 7,
        grade: 5,
        topic: "Fractions & Decimals",
        question: "Convert 3/5 into a decimal.",
        options: ["0.25", "0.3", "0.6", "0.75"],
        answer: "0.6",
      },
      {
        id: 8,
        grade: 5,
        topic: "Fractions & Decimals",
        question: "Which fraction is greater? 5/8 or 3/4.",
        options: ["5/8", "3/4", "2/3", "7/10"],
        answer: "3/4",
      },
      {
        id: 9,
        grade: 5,
        topic: "Fractions & Decimals",
        question: "Add: 2/7 + 3/7",
        options: ["4/7", "5/7", "6/7", "7/7"],
        answer: "5/7",
      },
      {
        id: 10,
        grade: 5,
        topic: "Fractions & Decimals",
        question: "Change 1.25 to a fraction.",
        options: ["5/4", "4/5", "125/10", "12/5"],
        answer: "5/4",
      },

      // 🟦 Factors & Multiples
      {
        id: 11,
        grade: 5,
        topic: "Factors & Multiples",
        question: "Find the LCM of 12 and 18.",
        options: ["24", "36", "48", "60"],
        answer: "36",
      },
      {
        id: 12,
        grade: 5,
        topic: "Factors & Multiples",
        question: "Find the HCF of 24 and 36.",
        options: ["6", "8", "12", "18"],
        answer: "12",
      },
      {
        id: 13,
        grade: 5,
        topic: "Factors & Multiples",
        question: "Is 97 a prime or composite number?",
        options: ["Prime", "Composite", "Even", "Odd"],
        answer: "Prime",
      },
      {
        id: 14,
        grade: 5,
        topic: "Factors & Multiples",
        question: "Which of the following is a multiple of 9?",
        options: ["25", "36", "42", "52"],
        answer: "36",
      },
      {
        id: 15,
        grade: 5,
        topic: "Factors & Multiples",
        question: "Find the first 3 multiples of 7.",
        options: ["7, 14, 21", "7, 15, 22", "6, 12, 18", "5, 10, 15"],
        answer: "7, 14, 21",
      },

      // 🟦 Geometry
      {
        id: 16,
        grade: 5,
        topic: "Geometry",
        question: "A triangle has angles 40° and 65°. The third angle is:",
        options: ["55°", "65°", "75°", "85°"],
        answer: "75°",
      },
      {
        id: 17,
        grade: 5,
        topic: "Geometry",
        question:
          "A rectangle has length 12 cm and width 5 cm. Its perimeter is:",
        options: ["17 cm", "24 cm", "34 cm", "60 cm"],
        answer: "34 cm",
      },
      {
        id: 18,
        grade: 5,
        topic: "Geometry",
        question:
          "A quadrilateral with only one pair of parallel sides is called:",
        options: ["Rectangle", "Square", "Parallelogram", "Trapezium"],
        answer: "Trapezium",
      },
      {
        id: 19,
        grade: 5,
        topic: "Geometry",
        question: "What type of triangle has all equal sides?",
        options: ["Isosceles", "Equilateral", "Scalene", "Right-angled"],
        answer: "Equilateral",
      },
      {
        id: 20,
        grade: 5,
        topic: "Geometry",
        question: "The sum of the angles of a quadrilateral is:",
        options: ["180°", "270°", "360°", "540°"],
        answer: "360°",
      },
      {
        id: 21,
        grade: 5,
        topic: "Geometry",
        question: "A square has side 8 cm. Find its area.",
        options: ["16 cm²", "32 cm²", "64 cm²", "128 cm²"],
        answer: "64 cm²",
      },
      {
        id: 22,
        grade: 5,
        topic: "Geometry",
        question:
          "A box has length 5 cm, width 4 cm, and height 3 cm. Find its volume.",
        options: ["12 cm³", "20 cm³", "40 cm³", "60 cm³"],
        answer: "60 cm³",
      },
      {
        id: 23,
        grade: 5,
        topic: "Geometry",
        question: "Convert 3.5 meters to centimeters.",
        options: ["35 cm", "350 cm", "3,500 cm", "0.35 cm"],
        answer: "350 cm",
      },
      {
        id: 24,
        grade: 5,
        topic: "Geometry",
        question:
          "A rectangle has area 45 cm² and length 9 cm. What is its width?",
        options: ["4 cm", "5 cm", "6 cm", "7 cm"],
        answer: "5 cm",
      },
      {
        id: 25,
        grade: 5,
        topic: "Geometry",
        question: "The perimeter of a square is 40 cm. Find its side length.",
        options: ["8 cm", "10 cm", "12 cm", "16 cm"],
        answer: "10 cm",
      },

      // 🟦 Data & Statistics
      {
        id: 26,
        grade: 5,
        topic: "Data & Statistics",
        question:
          "The marks of 5 students are: 20, 15, 25, 10, 30. What is the highest mark?",
        options: ["15", "25", "30", "20"],
        answer: "30",
      },
      {
        id: 27,
        grade: 5,
        topic: "Data & Statistics",
        question: "Find the average of the marks above (20, 15, 25, 10, 30).",
        options: ["18", "20", "21", "22"],
        answer: "20",
      },
      {
        id: 28,
        grade: 5,
        topic: "Data & Statistics",
        question:
          "In a class of 40 students, 24 are boys. What fraction are girls?",
        options: ["24/40", "16/40", "3/5", "2/3"],
        answer: "16/40",
      },
      {
        id: 29,
        grade: 5,
        topic: "Data & Statistics",
        question:
          "The bar chart shows apples sold: Jan=20, Feb=25, Mar=15. Which month had the most sales?",
        options: ["January", "February", "March", "Same in all months"],
        answer: "February",
      },
      {
        id: 30,
        grade: 5,
        topic: "Data & Statistics",
        question: "The mode of the numbers 2, 3, 5, 3, 6, 3, 4 is:",
        options: ["2", "3", "4", "5"],
        answer: "3",
      },
    ],
    [
      // 🟦 Whole Numbers & Decimals
      {
        id: 1,
        grade: 6,
        topic: "Whole Numbers & Decimals",
        question: "Write in words: 305.47",
        options: [
          "Three hundred five and forty-seven hundredths",
          "Three hundred fifty-four and seven tenths",
          "Three hundred five thousand forty-seven",
          "Three hundred five point four seven",
        ],
        answer: "Three hundred five and forty-seven hundredths",
      },
      {
        id: 2,
        grade: 6,
        topic: "Whole Numbers & Decimals",
        question: "Round 78.462 to the nearest hundredth.",
        options: ["78.46", "78.47", "78.5", "78"],
        answer: "78.46",
      },
      {
        id: 3,
        grade: 6,
        topic: "Whole Numbers & Decimals",
        question: "Convert 4.25 into a fraction in simplest form.",
        options: ["425/100", "17/4", "425/10", "85/20"],
        answer: "17/4",
      },
      {
        id: 4,
        grade: 6,
        topic: "Whole Numbers & Decimals",
        question: "Write in Roman numerals: 64",
        options: ["LXIV", "XLIV", "LXV", "LXVI"],
        answer: "LXIV",
      },
      {
        id: 5,
        grade: 6,
        topic: "Whole Numbers & Decimals",
        question: "Which is greater: 3.705 or 3.075?",
        options: ["3.705", "3.075", "They are equal", "Cannot be compared"],
        answer: "3.705",
      },

      // 🟥 Fractions
      {
        id: 6,
        grade: 6,
        topic: "Fractions",
        question: "Simplify: 48/60",
        options: ["12/15", "4/5", "24/30", "8/15"],
        answer: "4/5",
      },
      {
        id: 7,
        grade: 6,
        topic: "Fractions",
        question: "Find the sum: 2/3 + 3/4",
        options: ["17/12", "5/7", "1 5/12", "1 1/3"],
        answer: "17/12",
      },
      {
        id: 8,
        grade: 6,
        topic: "Fractions",
        question: "Multiply: 7/8 × 4/21",
        options: ["1/6", "28/168", "2/9", "1/12"],
        answer: "1/6",
      },
      {
        id: 9,
        grade: 6,
        topic: "Fractions",
        question: "Which is larger: 7/12 or 5/8?",
        options: ["7/12", "5/8", "They are equal", "Cannot be compared"],
        answer: "5/8",
      },
      {
        id: 10,
        grade: 6,
        topic: "Fractions",
        question: "Express 2.75 as a fraction.",
        options: ["11/4", "27/10", "275/100", "7/2"],
        answer: "11/4",
      },

      // 🟨 Geometry
      {
        id: 11,
        grade: 6,
        topic: "Geometry",
        question:
          "Find the area of a triangle with base 12 cm and height 8 cm.",
        options: ["48 cm²", "96 cm²", "20 cm²", "100 cm²"],
        answer: "48 cm²",
      },
      {
        id: 12,
        grade: 6,
        topic: "Geometry",
        question: "How many diagonals does a hexagon have?",
        options: ["6", "9", "12", "15"],
        answer: "9",
      },
      {
        id: 13,
        grade: 6,
        topic: "Geometry",
        question: "The sum of interior angles of a quadrilateral is:",
        options: ["180°", "270°", "360°", "540°"],
        answer: "360°",
      },
      {
        id: 14,
        grade: 6,
        topic: "Geometry",
        question:
          "Find the circumference of a circle with radius 7 cm (π = 22/7).",
        options: ["44 cm", "22 cm", "14 cm", "49 cm"],
        answer: "44 cm",
      },
      {
        id: 15,
        grade: 6,
        topic: "Geometry",
        question: "Which of these is always true for a rectangle?",
        options: [
          "All sides are equal",
          "Opposite sides are equal and parallel",
          "All angles are 60°",
          "It has 3 diagonals",
        ],
        answer: "Opposite sides are equal and parallel",
      },

      // 🟩 Ratio & Proportion
      {
        id: 16,
        grade: 6,
        topic: "Ratio & Proportion",
        question: "The ratio of 24 to 36 in simplest form is:",
        options: ["2:3", "3:2", "4:6", "12:18"],
        answer: "2:3",
      },
      {
        id: 17,
        grade: 6,
        topic: "Ratio & Proportion",
        question: "If 5 pencils cost 10 LE, what is the cost of 8 pencils?",
        options: ["12 LE", "14 LE", "16 LE", "20 LE"],
        answer: "16 LE",
      },
      {
        id: 18,
        grade: 6,
        topic: "Ratio & Proportion",
        question: "Solve for x: 3/4 = x/20",
        options: ["10", "12", "15", "16"],
        answer: "15",
      },
      {
        id: 19,
        grade: 6,
        topic: "Ratio & Proportion",
        question:
          "The map scale is 1 cm : 5 km. What distance does 7 cm represent?",
        options: ["25 km", "30 km", "35 km", "40 km"],
        answer: "35 km",
      },
      {
        id: 20,
        grade: 6,
        topic: "Ratio & Proportion",
        question: "Which is equivalent to 45%?",
        options: ["9/20", "45/100", "0.45", "All of the above"],
        answer: "All of the above",
      },

      // 🟦 Statistics & Data
      {
        id: 21,
        grade: 6,
        topic: "Statistics",
        question: "The marks are: 10, 15, 20, 25, 30. Find the mean.",
        options: ["18", "20", "22", "25"],
        answer: "20",
      },
      {
        id: 22,
        grade: 6,
        topic: "Statistics",
        question: "Which type of chart is best to show parts of a whole?",
        options: ["Bar graph", "Pie chart", "Line graph", "Pictograph"],
        answer: "Pie chart",
      },
      {
        id: 23,
        grade: 6,
        topic: "Statistics",
        question: "The mode of the data 2, 3, 3, 4, 5, 5, 5, 6 is:",
        options: ["2", "3", "4", "5"],
        answer: "5",
      },
      {
        id: 24,
        grade: 6,
        topic: "Statistics",
        question: "The range of 12, 18, 25, 30, 35 is:",
        options: ["18", "23", "35", "25"],
        answer: "23",
      },
      {
        id: 25,
        grade: 6,
        topic: "Statistics",
        question: "What is the median of 8, 12, 15, 20, 22?",
        options: ["15", "12", "20", "22"],
        answer: "15",
      },
    ],
    [
      // 🟦 Algebra
      {
        id: 1,
        grade: 7,
        topic: "Algebra",
        question: "Simplify: 3x + 4x - 5",
        options: ["7x - 5", "12x - 5", "3x - 1", "x - 5"],
        answer: "7x - 5",
      },
      {
        id: 2,
        grade: 7,
        topic: "Algebra",
        question: "Solve: 2x + 5 = 11",
        options: ["x = 6", "x = 3", "x = 2", "x = 5"],
        answer: "x = 3",
      },
      {
        id: 3,
        grade: 7,
        topic: "Algebra",
        question: "If y = 2, find the value of 3y²",
        options: ["6", "9", "12", "18"],
        answer: "12",
      },
      {
        id: 4,
        grade: 7,
        topic: "Algebra",
        question: "Factorize: x² + 5x",
        options: ["x(x+5)", "(x+5)(x+1)", "x²+1", "5(x+1)"],
        answer: "x(x+5)",
      },
      {
        id: 5,
        grade: 7,
        topic: "Algebra",
        question: "Expand: (x+3)(x+2)",
        options: ["x²+5x+6", "x²+6", "x²+6x+5", "x²+2x+3"],
        answer: "x²+5x+6",
      },

      // 🟦 Geometry
      {
        id: 6,
        grade: 7,
        topic: "Geometry",
        question: "The sum of interior angles of a pentagon is:",
        options: ["360°", "540°", "720°", "900°"],
        answer: "540°",
      },
      {
        id: 7,
        grade: 7,
        topic: "Geometry",
        question:
          "Find the area of a triangle with base = 10 cm and height = 8 cm.",
        options: ["40 cm²", "50 cm²", "60 cm²", "80 cm²"],
        answer: "40 cm²",
      },
      {
        id: 8,
        grade: 7,
        topic: "Geometry",
        question: "The diagonals of a square are:",
        options: [
          "Equal and perpendicular",
          "Equal but not perpendicular",
          "Perpendicular but not equal",
          "None of the above",
        ],
        answer: "Equal and perpendicular",
      },
      {
        id: 9,
        grade: 7,
        topic: "Geometry",
        question:
          "The radius of a circle is 7 cm. Find its area. (Take π = 22/7)",
        options: ["154 cm²", "49 cm²", "44 cm²", "77 cm²"],
        answer: "154 cm²",
      },
      {
        id: 10,
        grade: 7,
        topic: "Geometry",
        question:
          "The sum of the measures of the angles in a triangle is always:",
        options: ["90°", "180°", "270°", "360°"],
        answer: "180°",
      },

      // 🟦 Ratio & Proportion
      {
        id: 11,
        grade: 7,
        topic: "Ratio & Proportion",
        question: "Simplify the ratio 15:25",
        options: ["3:5", "5:3", "2:5", "1:5"],
        answer: "3:5",
      },
      {
        id: 12,
        grade: 7,
        topic: "Ratio & Proportion",
        question: "If 5 pencils cost 20 LE, how much do 8 pencils cost?",
        options: ["28 LE", "30 LE", "32 LE", "35 LE"],
        answer: "32 LE",
      },
      {
        id: 13,
        grade: 7,
        topic: "Ratio & Proportion",
        question: "The ratio 2:3 is equivalent to:",
        options: ["6:9", "4:5", "8:10", "3:5"],
        answer: "6:9",
      },
      {
        id: 14,
        grade: 7,
        topic: "Ratio & Proportion",
        question:
          "If 12 workers finish a task in 8 days, how many days will 6 workers need?",
        options: ["4 days", "8 days", "12 days", "16 days"],
        answer: "16 days",
      },
      {
        id: 15,
        grade: 7,
        topic: "Ratio & Proportion",
        question:
          "A map uses a scale of 1:1000. What is the actual distance if the map distance is 5 cm?",
        options: ["50 m", "500 m", "5 m", "5000 m"],
        answer: "50 m",
      },

      // 🟦 Statistics
      {
        id: 16,
        grade: 7,
        topic: "Statistics",
        question: "Find the mean of: 2, 4, 6, 8, 10",
        options: ["4", "5", "6", "7"],
        answer: "6",
      },
      {
        id: 17,
        grade: 7,
        topic: "Statistics",
        question: "The mode of 5, 7, 8, 7, 10, 7 is:",
        options: ["5", "7", "8", "10"],
        answer: "7",
      },
      {
        id: 18,
        grade: 7,
        topic: "Statistics",
        question: "The median of 12, 8, 14, 10, 6 is:",
        options: ["8", "10", "12", "14"],
        answer: "10",
      },
      {
        id: 19,
        grade: 7,
        topic: "Statistics",
        question:
          "Which graph is best to represent a comparison of categories?",
        options: ["Bar graph", "Line graph", "Histogram", "Pictograph"],
        answer: "Bar graph",
      },
      {
        id: 20,
        grade: 7,
        topic: "Statistics",
        question: "The range of 3, 8, 6, 10, 5 is:",
        options: ["5", "6", "7", "8"],
        answer: "7",
      },
    ],
    [
      // 🟦 Algebra
      {
        id: 1,
        grade: 8,
        topic: "Algebra",
        question: "Simplify: (x + 3)(x - 3)",
        options: ["x² - 9", "x² + 9", "x² - 6x + 9", "x² + 6x + 9"],
        answer: "x² - 9",
      },
      {
        id: 2,
        grade: 8,
        topic: "Algebra",
        question: "Solve: 3x - 7 = 11",
        options: ["x = 6", "x = 5", "x = 7", "x = 4"],
        answer: "x = 6",
      },
      {
        id: 3,
        grade: 8,
        topic: "Algebra",
        question: "Factorize: x² + 7x + 12",
        options: ["(x+3)(x+4)", "(x+6)(x+2)", "(x+7)(x+12)", "None"],
        answer: "(x+3)(x+4)",
      },
      {
        id: 4,
        grade: 8,
        topic: "Algebra",
        question: "If x = 2, find the value of 2x² - 3x",
        options: ["2", "5", "10", "8"],
        answer: "2",
      },
      {
        id: 5,
        grade: 8,
        topic: "Algebra",
        question: "Expand: (2x + 5)²",
        options: ["4x²+20x+25", "2x²+25", "2x²+10x+25", "4x²+25"],
        answer: "4x²+20x+25",
      },

      // 🟦 Geometry
      {
        id: 6,
        grade: 8,
        topic: "Geometry",
        question: "The exterior angle of a triangle is equal to:",
        options: [
          "The sum of the two opposite interior angles",
          "Half the interior angle",
          "180°",
          "90°",
        ],
        answer: "The sum of the two opposite interior angles",
      },
      {
        id: 7,
        grade: 8,
        topic: "Geometry",
        question: "Find the volume of a cube of side 4 cm.",
        options: ["16 cm³", "64 cm³", "32 cm³", "48 cm³"],
        answer: "64 cm³",
      },
      {
        id: 8,
        grade: 8,
        topic: "Geometry",
        question: "A triangle has angles 60°, 60°, 60°. It is:",
        options: ["Scalene", "Isosceles", "Equilateral", "Right"],
        answer: "Equilateral",
      },
      {
        id: 9,
        grade: 8,
        topic: "Geometry",
        question: "The diagonals of a rectangle are:",
        options: [
          "Equal and bisect each other",
          "Equal but not bisect",
          "Unequal",
          "Perpendicular",
        ],
        answer: "Equal and bisect each other",
      },
      {
        id: 10,
        grade: 8,
        topic: "Geometry",
        question:
          "Find the circumference of a circle with diameter 14 cm (π = 22/7).",
        options: ["22 cm", "28 cm", "44 cm", "66 cm"],
        answer: "44 cm",
      },

      // 🟦 Trigonometry (Introduced in Prep 2)
      {
        id: 11,
        grade: 8,
        topic: "Trigonometry",
        question: "If sin θ = 3/5, then cos θ = ?",
        options: ["4/5", "5/3", "3/4", "1/2"],
        answer: "4/5",
      },
      {
        id: 12,
        grade: 8,
        topic: "Trigonometry",
        question: "tan 45° =",
        options: ["0", "1", "√3", "∞"],
        answer: "1",
      },
      {
        id: 13,
        grade: 8,
        topic: "Trigonometry",
        question: "sin 30° =",
        options: ["1/2", "√3/2", "1", "0"],
        answer: "1/2",
      },
      {
        id: 14,
        grade: 8,
        topic: "Trigonometry",
        question: "cos 60° =",
        options: ["0", "1/2", "√3/2", "1"],
        answer: "1/2",
      },
      {
        id: 15,
        grade: 8,
        topic: "Trigonometry",
        question: "The Pythagorean identity is:",
        options: [
          "sin²θ + cos²θ = 1",
          "tan²θ + 1 = sec²θ",
          "cot²θ + 1 = csc²θ",
          "All of the above",
        ],
        answer: "All of the above",
      },

      // 🟦 Statistics
      {
        id: 16,
        grade: 8,
        topic: "Statistics",
        question: "Find the mean of: 10, 20, 30, 40",
        options: ["20", "25", "30", "40"],
        answer: "25",
      },
      {
        id: 17,
        grade: 8,
        topic: "Statistics",
        question: "The mode of 2, 3, 3, 4, 5, 5, 5 is:",
        options: ["2", "3", "4", "5"],
        answer: "5",
      },
      {
        id: 18,
        grade: 8,
        topic: "Statistics",
        question: "The median of 7, 9, 10, 15, 18 is:",
        options: ["9", "10", "12", "15"],
        answer: "10",
      },
      {
        id: 19,
        grade: 8,
        topic: "Statistics",
        question: "Which graph shows frequency distribution?",
        options: ["Line graph", "Histogram", "Bar graph", "Pie chart"],
        answer: "Histogram",
      },
      {
        id: 20,
        grade: 8,
        topic: "Statistics",
        question: "The range of 15, 20, 25, 40 is:",
        options: ["20", "25", "30", "35"],
        answer: "25",
      },
    ],
    [
      // 📊 Algebra
      {
        id: 1,
        grade: 9,
        topic: "Algebra",
        question: "Simplify: (x + 3)(x – 3)",
        options: ["x² – 9", "x² + 9", "x² – 6x + 9", "x² + 6x – 9"],
        answer: "x² – 9",
      },
      {
        id: 2,
        grade: 9,
        topic: "Algebra",
        question: "Solve: 2x – 5 = 9",
        options: ["x = 2", "x = 3", "x = 7", "x = –7"],
        answer: "x = 7",
      },
      {
        id: 3,
        grade: 9,
        topic: "Algebra",
        question: "Factorize: x² + 5x + 6",
        options: [
          "(x + 2)(x + 3)",
          "(x – 2)(x – 3)",
          "(x + 1)(x + 6)",
          "(x – 1)(x – 6)",
        ],
        answer: "(x + 2)(x + 3)",
      },
      {
        id: 4,
        grade: 9,
        topic: "Algebra",
        question: "If f(x) = 2x + 1, find f(3).",
        options: ["5", "6", "7", "8"],
        answer: "7",
      },
      {
        id: 5,
        grade: 9,
        topic: "Algebra",
        question: "Solve: x² = 49",
        options: ["x = 7 only", "x = –7 only", "x = ±7", "x = 0"],
        answer: "x = ±7",
      },

      // 📐 Geometry
      {
        id: 6,
        grade: 9,
        topic: "Geometry",
        question: "The sum of angles in a triangle is:",
        options: ["90°", "180°", "270°", "360°"],
        answer: "180°",
      },
      {
        id: 7,
        grade: 9,
        topic: "Geometry",
        question:
          "A quadrilateral with both pairs of opposite sides parallel is called:",
        options: ["Trapezium", "Parallelogram", "Kite", "Rhombus"],
        answer: "Parallelogram",
      },
      {
        id: 8,
        grade: 9,
        topic: "Geometry",
        question:
          "Find the area of a triangle with base 10 cm and height 8 cm.",
        options: ["40 cm²", "80 cm²", "20 cm²", "100 cm²"],
        answer: "40 cm²",
      },
      {
        id: 9,
        grade: 9,
        topic: "Geometry",
        question:
          "In a circle, the angle at the center is ______ the angle at the circumference on the same arc.",
        options: ["Equal to", "Double", "Half", "One third"],
        answer: "Double",
      },
      {
        id: 10,
        grade: 9,
        topic: "Geometry",
        question: "The diagonals of a rhombus:",
        options: [
          "Are equal",
          "Bisect each other at 90°",
          "Are parallel",
          "Are not related",
        ],
        answer: "Bisect each other at 90°",
      },

      // 📈 Statistics
      {
        id: 11,
        grade: 9,
        topic: "Statistics",
        question: "Find the mean of: 2, 4, 6, 8, 10",
        options: ["5", "6", "7", "8"],
        answer: "6",
      },
      {
        id: 12,
        grade: 9,
        topic: "Statistics",
        question: "The probability of getting an odd number on a die is:",
        options: ["1/2", "1/3", "1/6", "2/3"],
        answer: "1/2",
      },
      {
        id: 13,
        grade: 9,
        topic: "Statistics",
        question: "The mode of the numbers 2, 5, 7, 7, 9, 10 is:",
        options: ["2", "5", "7", "9"],
        answer: "7",
      },
      {
        id: 14,
        grade: 9,
        topic: "Statistics",
        question: "If P(E) = 0.25, then the probability of not E is:",
        options: ["0.25", "0.50", "0.75", "1"],
        answer: "0.75",
      },
      {
        id: 15,
        grade: 9,
        topic: "Statistics",
        question:
          "A bag has 3 red and 2 blue balls. Probability of picking a red ball:",
        options: ["1/2", "2/5", "3/5", "3/2"],
        answer: "3/5",
      },

      // 📐 Trigonometry
      {
        id: 16,
        grade: 9,
        topic: "Trigonometry",
        question: "sin 30° = ?",
        options: ["1/2", "√3/2", "0", "1"],
        answer: "1/2",
      },
      {
        id: 17,
        grade: 9,
        topic: "Trigonometry",
        question: "cos 60° = ?",
        options: ["1/2", "√3/2", "0", "1"],
        answer: "1/2",
      },
      {
        id: 18,
        grade: 9,
        topic: "Trigonometry",
        question: "In a right triangle, tan θ = ?",
        options: [
          "Opposite / Hypotenuse",
          "Adjacent / Hypotenuse",
          "Opposite / Adjacent",
          "Hypotenuse / Adjacent",
        ],
        answer: "Opposite / Adjacent",
      },
      {
        id: 19,
        grade: 9,
        topic: "Trigonometry",
        question: "If sin θ = 3/5, find cos θ (θ acute).",
        options: ["4/5", "5/3", "√21/5", "2/5"],
        answer: "4/5",
      },
      {
        id: 20,
        grade: 9,
        topic: "Trigonometry",
        question: "The value of sin²θ + cos²θ is always:",
        options: ["0", "1", "2", "Depends on θ"],
        answer: "1",
      },
    ],
    [
      // Algebra
      {
        id: 1,
        grade: 10,
        topic: "Algebra",
        question: "Simplify: (x + 3)(x - 3)",
        options: ["x² - 9", "x² + 9", "x² + 6x - 9", "x² - 6x + 9"],
        answer: "x² - 9",
      },
      {
        id: 2,
        grade: 10,
        topic: "Algebra",
        question: "Solve for x: 2x - 5 = 9",
        options: ["x = 2", "x = 5", "x = 7", "x = -7"],
        answer: "x = 7",
      },
      {
        id: 3,
        grade: 10,
        topic: "Algebra",
        question: "If f(x) = 2x + 1, find f(3).",
        options: ["5", "6", "7", "8"],
        answer: "7",
      },
      {
        id: 4,
        grade: 10,
        topic: "Algebra",
        question: "Factorize: x² + 7x + 10",
        options: [
          "(x + 2)(x + 5)",
          "(x + 1)(x + 10)",
          "(x + 3)(x + 4)",
          "(x - 2)(x - 5)",
        ],
        answer: "(x + 2)(x + 5)",
      },
      {
        id: 5,
        grade: 10,
        topic: "Algebra",
        question: "Solve for y: 3y + 2 = 11",
        options: ["y = 2", "y = 3", "y = 4", "y = 5"],
        answer: "y = 3",
      },

      // Geometry
      {
        id: 6,
        grade: 10,
        topic: "Geometry",
        question: "The sum of the interior angles of a pentagon is:",
        options: ["360°", "540°", "720°", "900°"],
        answer: "540°",
      },
      {
        id: 7,
        grade: 10,
        topic: "Geometry",
        question:
          "Find the area of a triangle with base 12 cm and height 8 cm.",
        options: ["48 cm²", "60 cm²", "72 cm²", "96 cm²"],
        answer: "48 cm²",
      },
      {
        id: 8,
        grade: 10,
        topic: "Geometry",
        question:
          "A circle has radius 7 cm. Find its circumference (π = 22/7).",
        options: ["22 cm", "44 cm", "66 cm", "77 cm"],
        answer: "44 cm",
      },
      {
        id: 9,
        grade: 10,
        topic: "Geometry",
        question:
          "If two triangles are similar, then their corresponding sides are:",
        options: ["Equal", "Proportional", "Unequal", "Parallel"],
        answer: "Proportional",
      },
      {
        id: 10,
        grade: 10,
        topic: "Geometry",
        question: "The diagonals of a rectangle are always:",
        options: ["Equal", "Perpendicular", "Unequal", "None"],
        answer: "Equal",
      },

      // Trigonometry
      {
        id: 11,
        grade: 10,
        topic: "Trigonometry",
        question: "sin 30° = ?",
        options: ["1", "1/2", "√3/2", "0"],
        answer: "1/2",
      },
      {
        id: 12,
        grade: 10,
        topic: "Trigonometry",
        question: "cos 60° = ?",
        options: ["1", "0", "1/2", "√3/2"],
        answer: "1/2",
      },
      {
        id: 13,
        grade: 10,
        topic: "Trigonometry",
        question: "tan 45° = ?",
        options: ["0", "1", "√3", "∞"],
        answer: "1",
      },
      {
        id: 14,
        grade: 10,
        topic: "Trigonometry",
        question: "Find the hypotenuse if sin θ = 3/5 and opposite = 6.",
        options: ["8", "9", "10", "12"],
        answer: "10",
      },
      {
        id: 15,
        grade: 10,
        topic: "Trigonometry",
        question: "Which identity is correct?",
        options: [
          "sin²θ + cos²θ = 1",
          "sin²θ - cos²θ = 1",
          "tan²θ + 1 = cos²θ",
          "cot²θ + 1 = sec²θ",
        ],
        answer: "sin²θ + cos²θ = 1",
      },

      // Probability & Statistics
      {
        id: 16,
        grade: 10,
        topic: "Statistics",
        question: "The mean of 5, 10, 15 is:",
        options: ["5", "10", "15", "20"],
        answer: "10",
      },
      {
        id: 17,
        grade: 10,
        topic: "Statistics",
        question: "The mode of 2, 3, 3, 5, 7 is:",
        options: ["2", "3", "5", "7"],
        answer: "3",
      },
      {
        id: 18,
        grade: 10,
        topic: "Statistics",
        question: "The probability of getting a head in a coin toss is:",
        options: ["0", "1/2", "1", "2"],
        answer: "1/2",
      },
      {
        id: 19,
        grade: 10,
        topic: "Statistics",
        question: "The probability of getting a 6 when rolling a die is:",
        options: ["1/2", "1/3", "1/6", "1/12"],
        answer: "1/6",
      },
      {
        id: 20,
        grade: 10,
        topic: "Statistics",
        question: "The median of 3, 7, 9 is:",
        options: ["3", "7", "9", "5"],
        answer: "7",
      },
    ],
    [
      // Algebra
      {
        id: 1,
        grade: 11,
        topic: "Algebra",
        question: "Simplify: (x² - 4)/(x - 2)",
        options: ["x - 2", "x + 2", "x² + 2", "x - 4"],
        answer: "x + 2",
      },
      {
        id: 2,
        grade: 11,
        topic: "Algebra",
        question: "Solve: log₂(x) = 3",
        options: ["x = 6", "x = 8", "x = 9", "x = 12"],
        answer: "x = 8",
      },
      {
        id: 3,
        grade: 11,
        topic: "Algebra",
        question: "If f(x) = x², find f'(x).",
        options: ["2x", "x²", "x", "1"],
        answer: "2x",
      },
      {
        id: 4,
        grade: 11,
        topic: "Algebra",
        question: "Solve for x: 2^(x+1) = 16",
        options: ["x = 2", "x = 3", "x = 4", "x = 5"],
        answer: "x = 3",
      },
      {
        id: 5,
        grade: 11,
        topic: "Algebra",
        question: "Simplify: (x³y²)/(x²y)",
        options: ["xy", "x²y²", "x²/y", "x/y"],
        answer: "xy",
      },

      // Geometry
      {
        id: 6,
        grade: 11,
        topic: "Geometry",
        question: "The volume of a sphere is given by:",
        options: ["(4/3)πr³", "πr²h", "2πr", "πr²"],
        answer: "(4/3)πr³",
      },
      {
        id: 7,
        grade: 11,
        topic: "Geometry",
        question: "The sum of the interior angles of a decagon is:",
        options: ["1260°", "1440°", "1080°", "1620°"],
        answer: "1440°",
      },
      {
        id: 8,
        grade: 11,
        topic: "Geometry",
        question: "The distance between (0,0) and (3,4) is:",
        options: ["5", "6", "7", "4"],
        answer: "5",
      },
      {
        id: 9,
        grade: 11,
        topic: "Geometry",
        question: "The slope of a line perpendicular to slope 2 is:",
        options: ["-2", "1/2", "-1/2", "-1/2"],
        answer: "-1/2",
      },
      {
        id: 10,
        grade: 11,
        topic: "Geometry",
        question: "Equation of a circle with center (0,0) and radius r is:",
        options: [
          "x² + y² = r²",
          "x² - y² = r²",
          "x² + y² = r",
          "x² + y² = 2r",
        ],
        answer: "x² + y² = r²",
      },

      // Trigonometry
      {
        id: 11,
        grade: 11,
        topic: "Trigonometry",
        question: "cos²θ + sin²θ = ?",
        options: ["1", "0", "cos θ", "sin θ"],
        answer: "1",
      },
      {
        id: 12,
        grade: 11,
        topic: "Trigonometry",
        question: "tan(θ) = sin(θ)/?",
        options: ["cos(θ)", "tan(θ)", "sec(θ)", "csc(θ)"],
        answer: "cos(θ)",
      },
      {
        id: 13,
        grade: 11,
        topic: "Trigonometry",
        question: "If sin θ = 5/13, find cos θ (θ acute).",
        options: ["12/13", "5/12", "13/5", "1/12"],
        answer: "12/13",
      },
      {
        id: 14,
        grade: 11,
        topic: "Trigonometry",
        question: "sin(90° - θ) = ?",
        options: ["cos θ", "sin θ", "tan θ", "cot θ"],
        answer: "cos θ",
      },
      {
        id: 15,
        grade: 11,
        topic: "Trigonometry",
        question: "cos 2θ = ?",
        options: ["cos²θ - sin²θ", "cos²θ + sin²θ", "2cos θ", "2sin θ"],
        answer: "cos²θ - sin²θ",
      },

      // Calculus
      {
        id: 16,
        grade: 11,
        topic: "Calculus",
        question: "If y = x², dy/dx = ?",
        options: ["x", "2x", "x²", "1"],
        answer: "2x",
      },
      {
        id: 17,
        grade: 11,
        topic: "Calculus",
        question: "The derivative of sin x is:",
        options: ["cos x", "-cos x", "sin x", "-sin x"],
        answer: "cos x",
      },
      {
        id: 18,
        grade: 11,
        topic: "Calculus",
        question: "The derivative of ln x is:",
        options: ["1/x", "ln x", "x", "e^x"],
        answer: "1/x",
      },
      {
        id: 19,
        grade: 11,
        topic: "Calculus",
        question: "If y = e^x, dy/dx = ?",
        options: ["e^x", "x", "1", "ln x"],
        answer: "e^x",
      },
      {
        id: 20,
        grade: 11,
        topic: "Calculus",
        question: "The integral of dx is:",
        options: ["x + C", "1 + C", "C", "0"],
        answer: "x + C",
      },
    ],
  ];
  if (localStorage.quizzes !== "undefined" && localStorage.quizzes !== undefined && typeof localStorage.quizzes === 'object')
    quizzes = JSON.parse(localStorage.getItem('quizzes'));
  // localStorage.setItem('quizzes', JSON.stringify(quizzes))

  document.querySelector("form").onsubmit = function (event) {
    event.preventDefault();
    let quiz = {
      topic: topic.value,
      question: question.value,
      options: [choice1.value, choice2.value, choice3.value, choice4.value],
      answer: correctAnswer.value,
      grade: +grade.value,
    };
    let quizzesGrade = quizzes.filter((grade) => {
      return grade[0].grade === quiz.grade;
    })[0];
    quizzesGrade.push(quiz);
    quizzes.map((grade) => {
      grade[0].grade === quizzesGrade[0].grade ? quizzesGrade : grade;
    });
    localStorage.setItem('quizzes', JSON.stringify(quizzes))
  };
}
