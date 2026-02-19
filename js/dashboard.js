import { getJSON } from "./app.js";

async function initDashboard() {
  // Insert animated placeholders while we fetch
  const pointsEl = document.querySelector(".total-points");
  let pointsPlaceholder;
  if (pointsEl) {
    pointsEl.classList.add("invisible");
    pointsPlaceholder = document.createElement("div");
    pointsPlaceholder.className =
      "inline-block w-16 h-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse";
    pointsEl.parentNode.insertBefore(pointsPlaceholder, pointsEl);
  }

  const tbody = document.querySelector("tbody");
  let skeletonRows = [];
  if (tbody) {
    // show 3 skeleton rows while loading
    for (let i = 0; i < 3; i++) {
      const tr = document.createElement("tr");
      tr.className = "animate-pulse opacity-80";
      tr.innerHTML = `
        <td class="px-6 py-4"><div class="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700"></div></td>
        <td class="px-6 py-4"><div class="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700"></div></td>
        <td class="px-6 py-4 hidden sm:table-cell"><div class="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div></td>
        <td class="px-6 py-4 text-right"><div class="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700"></div></td>
      `;
      tbody.appendChild(tr);
      skeletonRows.push(tr);
    }
  }

  try {
    const res = await getJSON("/users/me");
    const data = res.data;

    // Update name & email in profile menu
    const nameEls = document
      .querySelectorAll(".profile-name")
      .forEach(
        (el) => (el.textContent = data.name || data.username || "Student"),
      );
    const emailEls = document.querySelectorAll(".profile-email");
    emailEls.forEach((el) => (el.textContent = data.email || ""));

    // Update total points
    if (pointsPlaceholder) pointsPlaceholder.remove();
    if (pointsEl) {
      pointsEl.classList.remove("invisible");
      pointsEl.textContent = data.totalScore ?? "0";
    }

    // Leaderboard table population (if element exists)
    const leaderboard = data.leaderboard || [];
    if (tbody && leaderboard.length) {
      // replace table body with fetched rows (keep header)
      tbody.innerHTML = "";
      leaderboard.forEach((user, idx) => {
        const tr = document.createElement("tr");
        if (user._id === data._id) {
          tr.className =
            "group bg-primary/10 hover:bg-primary/20 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/20 transition-colors";
          console.log("done");
        } else {
          tr.className =
            "group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
        }
        tr.innerHTML = `
          <td class="px-6 py-4">${idx + 1}</td>
          <td class="px-6 py-4"><div class="flex items-center gap-3"><div class="size-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">${(
            user.name || ""
          )
            .split(" ")
            .map((n) => n[0] || "")
            .slice(0, 2)
            .join("")
            .toUpperCase()}</div><span class="font-bold text-slate-900 dark:text-white">${
            user.name || "Student"
          }</span></div></td>
          <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">${
            user.grade
          }th Grade</td>
          <td class="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${
            user.totalScore
          }</td>
        `;
        tbody.appendChild(tr);
      });
    } else if (tbody) {
      // No entries — show a friendly empty state
      tbody.innerHTML = `
        <tr><td class="px-6 py-8 text-center text-slate-500 dark:text-slate-400" colspan="4">No leaderboard data yet</td></tr>
      `;
    }

    // ---------- Lesson & Counters ----------
    // Update lessons completed and quizzes completed counters
    const lessonsCompletedEl = document.querySelector(".lessons-completed");
    if (lessonsCompletedEl)
      lessonsCompletedEl.textContent = String(data.lessonsCompleted ?? 0);
    const quizzesCompletedEl = document.querySelector(".quizzes-completed");
    if (quizzesCompletedEl)
      quizzesCompletedEl.textContent = String(data.quizzesCompleted ?? 0);

    // Populate the last opened lesson (if present)
    try {
      const lastLesson = data.latestLesson;
      const lastTitleEl = document.getElementById("last-lesson-title");
      const lastDescEl = document.getElementById("last-lesson-desc");
      const lastMetaEl = document.getElementById("last-lesson-meta");
      const lastImg = document.getElementById("last-lesson-image");
      const continueBtn = document.getElementById("continue-lesson-btn");

      function timeAgo(d) {
        const when = new Date(d);
        const diff = Date.now() - when.getTime();
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hrs / 24);
        return days > 0
          ? `${days} day${days > 1 ? "s" : ""} ago`
          : `${Math.max(1, hrs)} hour${hrs > 1 ? "s" : ""} ago`;
      }

      if (lastLesson && lastLesson._id) {
        // ----- Progress line -----
        const progressContainer = document.querySelector(
          ".last-lesson-progress-container",
        );
        if (progressContainer) {
          const progressFill =
            progressContainer.querySelector(".progress-fill");
          const progressText =
            progressContainer.querySelector(".progress-text");

          const progress = lastLesson.progress ?? 0; // get progress from backend
          progressFill.style.width = "0%"; // start from 0

          // animate to actual progress
          setTimeout(() => {
            progressFill.style.width = progress + "%";
            progressText.textContent = `Progress: ${progress}%`;
          }, 300); // small delay to trigger CSS transition
        }

        // ----- Lesson details -----
        if (lastTitleEl)
          lastTitleEl.textContent = lastLesson.title || "Untitled Lesson";
        if (lastDescEl)
          lastDescEl.textContent = lastLesson.topic
            ? `Topic: ${lastLesson.topic}`
            : "Continue where you left off.";
        if (lastMetaEl)
          lastMetaEl.textContent = lastLesson.openedAt
            ? `Last opened ${timeAgo(lastLesson.openedAt)}`
            : "";
        if (lastImg)
          lastImg.src = `https://picsum.photos/seed/${lastLesson._id}/800/800`;
        if (continueBtn) {
          continueBtn.href = `/lessons.html?id=${lastLesson._id}`;
          continueBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = `/lessons.html?id=${lastLesson._id}`;
          });
        }
      } else {
        if (lastTitleEl) lastTitleEl.textContent = "No recent lesson";
        if (lastDescEl)
          lastDescEl.textContent = "Start your first lesson to see it here";
        document.getElementById("continue-lesson-btn").textContent =
          "Browse Lessons";
        if (lastMetaEl) lastMetaEl.textContent = "";
        if (lastImg)
          lastImg.src = `https://picsum.photos/seed/default-lesson/800/800`;
        if (continueBtn) continueBtn.href = "/lessons.html";
      }
    } catch (errInner) {
      console.error("Failed to render last lesson", errInner);
    }

    // ---------- Recent Activities ----------
    const activities = data.latestActivities || [];
    const activityContainer = document.getElementById("recent-activity-list");
    if (activityContainer) {
      activityContainer.innerHTML = "";
      if (!activities.length) {
        activityContainer.innerHTML = `<div class="text-center text-slate-500 dark:text-slate-400 p-6">No recent activity</div>`;
      } else {
        activities.forEach((act, idx) => {
          const wrap = document.createElement("div");
          wrap.className = "flex gap-4";
          const dot = document.createElement("div");
          dot.className = "flex flex-col items-center";
          const dotInner = document.createElement("div");
          dotInner.className = `size-2 rounded-full ${
            idx === 0 ? "bg-primary" : "bg-slate-300"
          } mt-2`;
          dot.appendChild(dotInner);
          const content = document.createElement("div");
          const title = document.createElement("p");
          title.className = "text-sm font-bold text-slate-900 dark:text-white";
          title.textContent =
            act.description ||
            (act.activityType === "quiz"
              ? "Quiz completed"
              : "Lesson activity");
          const meta = document.createElement("p");
          meta.className = "text-xs text-slate-500 dark:text-slate-400 mt-1";
          // simple timeAgo
          const when = new Date(act.updatedAt || act.createdAt || Date.now());
          const diff = Date.now() - when.getTime();
          const hrs = Math.floor(diff / (1000 * 60 * 60));
          const days = Math.floor(hrs / 24);
          const timeText =
            days > 0
              ? `${days} day${days > 1 ? "s" : ""} ago`
              : `${Math.max(1, hrs)} hour${hrs > 1 ? "s" : ""} ago`;
          meta.textContent =
            (act.score !== undefined && act.score !== null && act.activityType === "quiz"
              ? `Scored ${act.score}% • `
              : "") + timeText;
          content.appendChild(title);
          content.appendChild(meta);
          wrap.appendChild(dot);
          wrap.appendChild(content);
          activityContainer.appendChild(wrap);
        });
      }
    }

    // ---------- Recommended Quizzes ----------
    const recs = data.reccommendedQuizzes || [];
    const recContainer = document.getElementById("recommended-quizzes");
    if (recContainer) {
      recContainer.innerHTML = "";
      if (!recs.length) {
        recContainer.innerHTML = `<div class="col-span-1 text-slate-500 dark:text-slate-400 p-6">No quizzes found</div>`;
      } else {
        recs.forEach((q) => {
          const a = document.createElement("a");
          a.className =
            "flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-[#192233] border border-slate-200 dark:border-[#232f48] hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all group";
          a.href = `/quiz.html?id=${q._id}`;
          a.innerHTML = `
            <div class="size-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">quiz</span>
            </div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${q.title}</span>
          `;
          recContainer.appendChild(a);
        });
      }
    }
  } catch (err) {
    // If not authorized, redirect to sign-in
    if (err.status === 401 || err.status === 403) {
      window.location.href = "/sign-in.html";
      console.log("not authorized");
    }
    console.error(err);
  } finally {
    // cleanup any remaining skeleton rows
    skeletonRows.forEach((r) => r.remove());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  const signout = document.getElementById("signout-btn");
  if (signout) {
    signout.addEventListener("click", async (e) => {
      e.preventDefault();
      await getJSON("/auth/sign-out");
      window.location.href = "/";
    });
  }
});
