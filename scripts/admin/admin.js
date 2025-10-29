// let [viewUsers, viewQuizzes, viewGroups] = document.querySelectorAll(".view");
// let [addUsers, addQuizzes, addGroups] = document.querySelectorAll(".add");
// let [editUsers, editQuizzes, editGroups] = document.querySelectorAll(".edit");
// let [deleteUsers, deleteQuizzes, deleteGroups] =
//   document.querySelectorAll(".delete");

// document.querySelectorAll(".view").forEach((element) => {
//   element.onclick = function () {
//     localStorage.setItem("type", this.textContent.split(" ")[2]);
//   };
// });
// document.querySelectorAll(".add").forEach((element) => {
//   element.onclick = function () {
//     localStorage.setItem("type", this.textContent.split(" ")[2]);
//   };
// });
// document.querySelectorAll(".edit").forEach((element) => {
//   element.onclick = function () {
//     localStorage.setItem("type", this.textContent.split(" ")[1]);
//   };
// });
// document.querySelectorAll(".delete").forEach((element) => {
//   element.onclick = function () {
//     localStorage.setItem("type", this.textContent.split(" ")[1]);
//   };
// });

window.addEventListener('load', function () {
  if (localStorage.title) {
    if (localStorage.title !== "admin") {
      document.body.innerHTML = `<h1>You can't enter this page</h1>`;
    }
  } else {
    location.href = "../../html/sign-in.html";
  }
});

document.querySelector(".links a").onclick = function () {
  location.replace("../../html/home.html");
};
