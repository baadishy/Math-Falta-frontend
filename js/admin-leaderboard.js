import { getJSON } from "./app.js";

let allUsers = [];
let sortedAllUsers = [];

function renderTable(users) {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const sorted = users
    .slice()
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  sorted.forEach((u) => {
    const tr = document.createElement("tr");
    tr.className =
      "group hover:bg-slate-50 dark:hover:bg-[#1a2333] transition-colors cursor-pointer";
    tr.innerHTML = `
      <td class="px-6 py-4 text-center">${sortedAllUsers.findIndex(user => user._id === u._id) + 1}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-4">
          <div class="size-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-border-dark text-xs font-bold flex items-center justify-center">${(
            u.name || ""
          )
            .split(" ")
            .map((n) => n[0] || "")
            .slice(0, 2)
            .join("")
            .toUpperCase()}</div>
          <div>
            <div class="font-bold text-slate-900 dark:text-white">${
              u.name || "Student"
            }</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">ID: ${
              u._id || ""
            }</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 text-center"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${
        u.grade || ""
      }</span></td>
      <td class="px-6 py-4 text-center"><span class="text-primary font-bold text-lg tabular-nums">${
        u.totalScore || 0
      }</span><span class="text-xs text-slate-400 ml-1">pts</span></td>
      <td class="px-6 py-4 text-center">${(u.quizzesTaken || 0)}</td>
    `;
    tr.addEventListener('click', () => {
        window.location.href = `/manage-user.html?id=${u._id}`;
    });
    tbody.appendChild(tr);
  });
  document.getElementById("users-count").textContent = users.length;
}

function applyFilters() {
    const searchInput = document.getElementById("search-input");
    const gradeSelect = document.getElementById("grade-select");

    const searchTerm = searchInput.value.toLowerCase();
    const grade = gradeSelect.value;

    let filteredUsers = allUsers;

    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm)
        );
    }

    if (grade) {
        filteredUsers = filteredUsers.filter(user => user.grade === grade);
    }

    renderTable(filteredUsers);
}

async function loadLeaderboard() {
  try {
    const res = await getJSON("/admin/users");
    allUsers = res.data || [];
    sortedAllUsers = allUsers
      .slice()
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    renderTable(allUsers);
    
    const applyButton = document.getElementById("apply-filters");
    applyButton.addEventListener("click", applyFilters);

    const searchInput = document.getElementById("search-input");
    const gradeSelect = document.getElementById("grade-select");

    [searchInput, gradeSelect].forEach(element => {
        element.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                applyFilters();
            }
        });
    });

  } catch (err) {
    console.error(err);
    if (err.status === 401) window.location.href = "/sign-in.html";
  }
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);
