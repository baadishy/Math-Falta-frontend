let logOutBtn = document.querySelector(".links a:last-of-type");
logOutBtn.onclick = function () {
  localStorage.removeItem("theUserId");
};

document.querySelector(".links a:first-of-type").onclick = async function () {
  if (localStorage.getItem("theUserId")) {
    let theUser = (
      await (
        await fetch(
          `https://math-falta.vercel.app/api/user/${localStorage.getItem(
            "theUserId"
          )}`
        )
      ).json()
    ).data;
    console.log(theUser);
    location.assign(`./grades-quizzez/grade-${theUser.grade}.html`);
  } else location.assign("./quizzes.html");
};
