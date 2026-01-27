import { postJSON } from "./app.js";

// Sign In
const signInForm = document.getElementById("signInForm");
if (signInForm) {
  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;
    try {
      const res = await postJSON("/auth/sign-in", { email, password });
      // On success, navigate to user dashboard
      if (!res.success) throw new Error("Sign in failed");
      if (res.isAdmin) {
        localStorage.setItem("isAdmin", true);
        window.location.href = "/admin-dashboard.html";
        return;
      }
      window.location.href = "/user-dashboard.html";
    } catch (err) {
      alert(err.payload?.msg || err.message || "Sign in failed");
    }
  });
}

// Sign Up
const signUpForm = document.getElementById("signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const parentNumber = document.getElementById("signup-parent").value.trim();
    const gradeEl = signUpForm.querySelector('input[name="grade"]:checked');
    const grade = gradeEl ? gradeEl.value : null;

    if (!grade) return alert("Please pick a grade");

    try {
      await postJSON("/auth/sign-up", {
        name,
        email,
        password,
        parentNumber,
        grade,
      });
      window.location.href = "/user-dashboard.html";
    } catch (err) {
      alert(err.payload?.msg || err.message || "Sign up failed");
    }
  });
}
