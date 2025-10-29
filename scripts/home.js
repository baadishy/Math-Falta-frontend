window.onload = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  setTimeout(function () {
    document.querySelector(".container").style.borderRadius = "0";
  }, 1200);
};
let signUpBtn = document.querySelector('.links a:nth-child(2)')

if (localStorage.getItem('theUserId')) {
  let startBtn = document.createElement('a')
  startBtn.textContent = 'Get Started'
  startBtn.href = './html/landing.html'
  signUpBtn.after(startBtn)
} 

