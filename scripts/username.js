window.onload = function () {
  scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
let usernamePart = document.querySelector(".username");
fetch(`https://math-falta.vercel.app/api/user/${localStorage.theUserId}`)
  .then((data) => data.json())
  .then((data) => (usernamePart.textContent = data.data.username));

usernamePart.onclick = function () {
  location.assign("./profile.html");
};

usernamePart.style.cursor = "pointer";
