import { getJSON, apiFetch } from "./app.js";
import {
  showToast,
  showLoading,
  hideLoading,
  createConfirmationPrompt,
} from "./ui.js";

let pendingUsers = [];

function initials(name) {
  return (name || "")
    .split(" ")
    .map((part) => part[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function createCard(user) {
  const card = document.createElement("article");
  card.className =
    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#192233]";

  const safePhone = (user.parentNumber || "").replace(/[^\d+]/g, "");

  card.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
          ${initials(user.name)}
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">${
            user.name || "Student"
          }</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">${
            user.email || "-"
          }</p>
        </div>
      </div>
      <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
        Pending
      </span>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
      <p><span class="font-semibold">Grade:</span> ${user.grade || "-"}</p>
      <p><span class="font-semibold">Parent Number:</span> ${
        user.parentNumber || "-"
      }</p>
      <p class="sm:col-span-2"><span class="font-semibold">Requested At:</span> ${formatDate(
        user.createdAt,
      )}</p>
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      <button data-action="approve" data-id="${
        user._id
      }" class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
        Approve
      </button>
      <button data-action="reject" data-id="${
        user._id
      }" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
        Reject
      </button>
      <a href="tel:${safePhone}" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
        Contact
      </a>
    </div>
  `;

  return card;
}

function renderApprovals() {
  const list = document.getElementById("approvals-list");
  const count = document.getElementById("approvals-count");
  if (!list || !count) return;

  count.textContent = String(pendingUsers.length);
  list.innerHTML = "";

  if (!pendingUsers.length) {
    list.innerHTML = `
      <div class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-600 dark:bg-[#192233] dark:text-slate-400">
        No pending approval requests.
      </div>
    `;
    return;
  }

  pendingUsers.forEach((user) => list.appendChild(createCard(user)));
}

async function loadPendingApprovals() {
  showLoading("Loading approvals...");
  try {
    const res = await getJSON("/admin/users/approvals/pending");
    pendingUsers = res.data || [];
    renderApprovals();
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      window.location.href = "sign-in.html";
      return;
    }
    showToast(
      err.payload?.message || err.message || "Failed to load approvals",
      "error",
    );
  } finally {
    hideLoading();
  }
}

async function updateApproval(userId, action) {
  showLoading(`${action === "approve" ? "Approving" : "Rejecting"} user...`);
  try {
    await apiFetch(`/admin/users/approvals/${userId}/${action}`, {
      method: "PATCH",
    });
    pendingUsers = pendingUsers.filter((user) => user._id !== userId);
    renderApprovals();
    showToast(
      action === "approve"
        ? "User approved successfully"
        : "User rejected successfully",
      "success",
    );
    document.dispatchEvent(new CustomEvent("approvalsUpdated"));
  } catch (err) {
    showToast(err.payload?.message || err.message || "Action failed", "error");
  } finally {
    hideLoading();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPendingApprovals();

  const list = document.getElementById("approvals-list");
  if (!list) return;

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const userId = button.dataset.id;
    if (!action || !userId) return;

    const confirmed = await createConfirmationPrompt(
      `Are you sure you want to ${action} this user?`,
    );
    if (!confirmed) return;

    button.disabled = true;
    try {
      await updateApproval(userId, action);
    } finally {
      button.disabled = false;
    }
  });
});
