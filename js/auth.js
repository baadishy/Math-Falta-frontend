import { postJSON } from "./app.js";
import { showToast } from "./ui.js";

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
        window.location.href = "admin-dashboard.html";
        return;
      }
      window.location.href = "user-dashboard.html";
    } catch (err) {
      showToast(err.payload?.msg || err.message || "Sign in failed", "error");
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

    if (!grade) return showToast("Please pick a grade", "warning");

    try {
      await postJSON("/auth/sign-up", {
        name,
        email,
        password,
        parentNumber,
        grade,
      });
      window.location.href = "user-dashboard.html";
    } catch (err) {
      showToast(err.payload?.msg || err.message || "Sign up failed", "error");
    }
  });
}

// 👁 Toggle password visibility (Sign In)
const signInPasswordInput = document.getElementById("signin-password");
const signUpPasswordInput = document.getElementById("signup-password");

const signIntoggleBtn =
  signInPasswordInput?.parentElement.querySelector("button");
const signUpToggleBtn =
  signUpPasswordInput?.parentElement.querySelector("button");

const signInToggleIcon = signIntoggleBtn?.querySelector("span");
const signUpToggleIcon = signUpToggleBtn?.querySelector("span");

if (signInPasswordInput && signIntoggleBtn && signInToggleIcon) {
  signIntoggleBtn.addEventListener("click", () => {
    const isHidden = signInPasswordInput.type === "password";

    signInPasswordInput.type = isHidden ? "text" : "password";
    signInToggleIcon.textContent = isHidden ? "visibility_off" : "visibility";
  });
} else if (signUpPasswordInput && signUpToggleBtn && signUpToggleIcon) {
  signUpToggleBtn.addEventListener("click", () => {
    const isHidden = signUpPasswordInput.type === "password";

    signUpPasswordInput.type = isHidden ? "text" : "password";
    signUpToggleIcon.textContent = isHidden ? "visibility_off" : "visibility";
  });
}

// 👁 Toggle password visibility (Sign Up )
