import { getJSON, deleteJSON } from "./app.js";
import { showToast } from "./ui.js";

let allUsers = [];

function renderTable(users) {
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;

  // Clear previous event listeners by replacing the tbody element
  const newTbody = tbody.cloneNode(false);
  tbody.parentNode.replaceChild(newTbody, tbody);

  newTbody.innerHTML = users
    .map(
      (user) => `
    <tr class="group hover:bg-slate-50 dark:hover:bg-[#202b3f] transition-colors cursor-pointer" data-id="${
      user._id
    }">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">${(
            user.name || ""
          )
            .split(" ")
            .map((n) => n[0] || "")
            .slice(0, 2)
            .join("")
            .toUpperCase()}</div>
          <div>
            <div class="font-medium text-slate-900 dark:text-white">${
              user.name || "User"
            }</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">${
              user.email || ""
            }</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">${
            user.grade || ""
          }</span>
      </td>
      <td class="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
          ${user.totalScore || 0}
      </td>
      <td class="px-6 py-4 text-center text-sm text-slate-500">${
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
      }</td>
      <td class="px-1 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button class="edit-user p-2 rounded-lg text-slate-400 hover:text-primary" data-id="${
            user._id
          }" aria-label="Edit user">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="delete-user p-2 rounded-lg text-slate-400 hover:text-red-600" data-id="${
            user._id
          }" aria-label="Delete user">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");

  document.getElementById("users-count").textContent = users.length;

  // A single event listener on the new table body to handle all actions
  newTbody.addEventListener("click", async (e) => {
    const button = e.target.closest("button");
    const row = e.target.closest("tr");
    if (!row) return;

    const id = row.dataset.id;
    if (!id) return;

    if (button && button.classList.contains("delete-user")) {
      // Handle delete action
      e.stopPropagation(); // Prevent row click from firing
      const confirmed = await createConfirmationPrompt(
        "Are you sure you want to delete this user? It can be restored later.",
      );
      if (!confirmed) return;
      try {
        await deleteJSON(`/admin/users/${id}`);
        allUsers = allUsers.filter((user) => user._id !== id);
        applyFilters(); // Re-apply filters and render
        showToast("User deleted successfully.", "success");
      } catch (err) {
        console.error("Delete failed:", err);
        showToast(
          `Failed to delete user: ${
            err.payload?.message || err.message || "Unknown error"
          }`,
          "error",
        );
      }
    } else {
      // Handle row click or edit button click as navigation
      window.location.href = `manage-user.html?id=${id}`;
    }
  });
}

function applyFilters() {
  const searchInput = document.getElementById("search-input");
  const gradeSelect = document.getElementById("grade-select");
  const sortSelect = document.getElementById("sort-select");

  const searchTerm = searchInput.value.toLowerCase();
  const grade = gradeSelect.value;
  const sort = sortSelect.value;

  let filteredUsers = allUsers;

  // Filter by search term (name or email)
  if (searchTerm) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)),
    );
  }

  // Filter by grade
  if (grade) {
    filteredUsers = filteredUsers.filter((user) => user.grade === grade);
  }

  // Sort the filtered users
  switch (sort) {
    case "newest":
      filteredUsers.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      break;
    case "score_desc":
      filteredUsers.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
      break;
    case "score_asc":
      filteredUsers.sort((a, b) => (a.totalScore || 0) - (b.totalScore || 0));
      break;
    case "name_asc":
      filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  renderTable(filteredUsers);
}

async function loadAdminUsers() {
  try {
    const res = await getJSON("/admin/users");
    allUsers = res.data || [];

    applyFilters(); // Initial render

    const searchInput = document.getElementById("search-input");
    const gradeSelect = document.getElementById("grade-select");
    const sortSelect = document.getElementById("sort-select");

    searchInput.addEventListener("input", applyFilters);
    gradeSelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
  } catch (err) {
    console.error("Failed to load admin users", err);
    if (err.status === 401 || err.status === 403) {
      window.location.href = "sign-in.html";
    }
  }
}

function createConfirmationPrompt(message) {
  return new Promise((resolve) => {
    // Remove any existing modals first
    const existingModal = document.querySelector(".confirmation-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50";
    modal.innerHTML = `
      <div class="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
        <div class="p-6">
          <h3 class="text-lg font-bold">Confirm Deletion</h3>
          <p class="text-sm text-slate-500 mt-2">${message}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector("#confirm-btn");
    const cancelBtn = modal.querySelector("#cancel-btn");
    const closeModal = () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    };

    confirmBtn.addEventListener("click", () => {
      closeModal();
      resolve(true);
    });

    cancelBtn.addEventListener("click", () => {
      closeModal();
      resolve(false);
    });

    // Also close on escape key
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeModal();
        resolve(false);
        window.removeEventListener("keydown", handleEsc);
      }
    };
    window.addEventListener("keydown", handleEsc);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminUsers();
});
