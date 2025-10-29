window.onload = function () {
  scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
let usernamePart = document.querySelector(".username");
fetch(`https://math-falta.free.nf/api.php?endpoint=user&id=${localStorage.theUserId}`)
  .then((data) => data.json())
  .then((data) => (usernamePart.textContent = data.data.username));

usernamePart.onclick = function () {
  location.assign("./profile.html");
};

usernamePart.style.cursor = "pointer";
