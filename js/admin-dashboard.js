import { getJSON } from "./app.js";

async function initAdminDashboard() {
  try {
    const dashboardData = await getJSON("/admin/dashboard");

    const users = dashboardData.data.leaderboard || [];
    const quizzes = dashboardData.data.recentQuizzes || [];
    const lessons = dashboardData.data.recentLessons || [];

    const totalStudents = dashboardData.data.stats.totalUsers || 0;
    const activeQuizzes = dashboardData.data.stats.totalQuizzes || 0;
    const lessonsCount = dashboardData.data.stats.totalLessons || 0;

    const elStudents = document.getElementById("stat-total-students");
    const elQuizzes = document.getElementById("stat-active-quizzes");
    const elLessons = document.getElementById("stat-lessons-completed");

    if (elStudents) elStudents.textContent = totalStudents.toLocaleString();
    if (elQuizzes) elQuizzes.textContent = activeQuizzes.toLocaleString();
    if (elLessons) elLessons.textContent = lessonsCount.toLocaleString();

    // Populate the Leaderboard list
    const leaderboardUsers = dashboardData.data.leaderboard || [];
    const leaderboardContainer = document.getElementById(
      "admin-leaderboard-list"
    );

    if (leaderboardContainer) {
      leaderboardContainer.innerHTML = "";

      leaderboardUsers.forEach((user, index) => {
        const initials = user.name
          ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "U";

        const row = document.createElement("tr");
        row.className =
          "cursor-pointer select-none transition-all hover:bg-primary/5 dark:hover:bg-primary/10";

        row.innerHTML = `
  <!-- Rank -->
  <td class="px-6 py-4 text-center font-medium">
    ${index + 1}
  </td>

  <!-- Name + ID -->
  <td class="px-6 py-4">
    <div class="flex flex-col">
      <span class="font-bold text-slate-900 dark:text-white">
        ${user.name}
      </span>
      <span class="text-xs text-slate-500 dark:text-slate-400">
        ID: ${user._id}
      </span>
    </div>
  </td>

  <!-- Grade -->
  <td class="px-6 py-4 text-center">
    <span class="inline-block rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
      ${user.grade ?? "-"}
    </span>
  </td>

  <!-- Total Score -->
  <td class="px-6 py-4 text-right"><span class="text-primary font-bold text-lg tabular-nums">${
    user.totalScore || 0
  }</span><span class="text-xs text-slate-400 ml-1">pts</span></td>
`;
        row.addEventListener("click", () => {
          window.location.href = `/manage-user.html?id=${user._id}`;
        });

        leaderboardContainer.appendChild(row);
        document.getElementById("admin-view-full-leaderboard")?.addEventListener("click", () => {
          window.location.href = "/admin-leaderboard.html";
        });
        document.getElementById("view-all-lessons")?.addEventListener("click", () => {
          window.location.href = "/manage-lessons.html";
        });
      });

      // update count
      const countEl = document.getElementById("users-count");
      if (countEl) countEl.textContent = users.length;
    }

    // ===============================
    // Quiz Control
    // ===============================
    const quizControlList = document.getElementById("admin-quiz-control-list");

    if (quizControlList) {
      quizControlList.innerHTML = "";

      if (!quizzes.length) {
        quizControlList.innerHTML =
          '<div class="text-slate-500 text-sm">No quizzes found</div>';
      } else {
        quizzes.forEach((quiz) => {
          // quiz status (simple logic)
          let statusLabel = quiz.isDeleted ? "Deleted" : "Active";
          let statusClasses = statusLabel === "Deleted"
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";

          // if (quiz.results?.attempts > 0) {
          //   statusLabel = "Active";
          //   statusClasses =
          //     "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
          // }

          const card = document.createElement("div");
          card.className =
            "rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#232f48]";

          card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses}">
              ${statusLabel}
            </span>
            <h4 class="mt-1 font-bold text-slate-900 dark:text-white">
              ${quiz.title}
            </h4>
          </div>
          <button
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            data-menu="${quiz._id}"
          >
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Grade ${quiz.grade ?? "-"}
          </span>
          <span>
            ${quiz.results?.attempts ?? 0} Participants
          </span>
        </div>

        <div class="mt-3 flex gap-2">
          <button
            class="flex-1 rounded bg-white py-1.5 text-xs font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
            data-results="${quiz._id}"
          >
            View Results
          </button>
          <button
            class="flex-1 rounded bg-primary py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-600"
            data-edit="${quiz._id}"
          >
            Edit
          </button>
        </div>
      `;

          // actions
          card.querySelector("[data-edit]")?.addEventListener("click", () => {
            window.location.href = `/edit-quiz.html?id=${quiz._id}`;
          });

          card
            .querySelector("[data-results]")
            ?.addEventListener("click", () => {
              window.location.href = `/view-quiz.html?id=${quiz._id}`;
            });

          quizControlList.appendChild(card);
        });
      }
    }

    // Populate the Manage Lessons list (show most recently updated)
    const listContainer = document.getElementById("admin-manage-lessons-list");
    if (listContainer) {
      listContainer.innerHTML = "";
      const top = lessons
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        )
        .slice(0, 5);
      if (!top.length) {
        listContainer.innerHTML =
          '<div class="p-4 text-slate-500">No lessons found</div>';
      } else {
        top.forEach((l) => {
          const item = document.createElement("div");
          item.className =
            "flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors";
          item.innerHTML = `
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-primary dark:bg-[#232f48] dark:text-white">
                <span class="material-symbols-outlined">functions</span>
              </div>
              <div class="flex flex-col">
                <p class="font-medium text-slate-900 dark:text-white">${
                  l.title
                }</p>
                <p class="text-sm text-slate-500 dark:text-[#92a4c9]">Updated ${new Date(
                  l.updatedAt || l.createdAt
                ).toLocaleString()}</p>
              </div>
            </div>
            <button class="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 dark:text-white dark:hover:bg-slate-700" data-id="${
              l._id
            }" title="Edit">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
          `;
          listContainer.appendChild(item);
          item.querySelector("button")?.addEventListener("click", () => {
            window.location.href = `/edit-lesson.html?id=${l._id}`;
          });
        });
      }
    }
    document.getElementById("add-new-lesson")?.addEventListener("click", () => {
      window.location.href = "/add-new-lesson.html";
    });
  } catch (err) {
    console.error("Failed to load admin dashboard data", err);
    if (err.status === 401) window.location.href = "/sign-in.html";
  }
}

document.addEventListener("DOMContentLoaded", initAdminDashboard);
