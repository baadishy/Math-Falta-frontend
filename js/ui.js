function getToastContainer() {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container fixed top-4 right-4 left-4 sm:left-auto sm:right-5 z-[120] flex flex-col gap-3 w-auto sm:w-80";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function getToastStyle(type) {
  switch (type) {
    case "success":
      return { icon: "check_circle", iconColor: "text-green-400" };
    case "error":
      return { icon: "cancel", iconColor: "text-red-400" };
    case "warning":
      return { icon: "warning", iconColor: "text-amber-400" };
    default:
      return { icon: "info", iconColor: "text-blue-400" };
  }
}

function showToast(message, type = "info", duration = 3000) {
  const toastContainer = getToastContainer();
  const toast = document.createElement("div");
  const { icon, iconColor } = getToastStyle(type);

  toast.className = `
    flex items-start gap-3 p-4 rounded-xl shadow-lg w-full
    bg-white dark:bg-[#1e293b] border border-slate-200/50 dark:border-slate-700/50
    transform transition-all duration-300 ease-in-out opacity-0 translate-y-2 sm:translate-x-10
  `;
  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-2xl">${icon}</span>
    <p class="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">${message}</p>
    <button class="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 close-toast">
      <span class="material-symbols-outlined text-base">close</span>
    </button>
  `;

  toastContainer.prepend(toast);

  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-2", "sm:translate-x-10");
  }, 20);

  const closeToast = () => {
    toast.classList.add(
      "opacity-0",
      "translate-y-2",
      "sm:translate-x-10",
      "h-0",
      "p-0",
      "border-0",
    );
    const onTransitionEnd = () => {
      toast.removeEventListener("transitionend", onTransitionEnd);
      toast.remove();
      if (toastContainer && !toastContainer.hasChildNodes()) {
        toastContainer.remove();
      }
    };
    toast.addEventListener("transitionend", onTransitionEnd);
  };

  const closeBtn = toast.querySelector(".close-toast");
  if (closeBtn) closeBtn.addEventListener("click", closeToast, { once: true });

  setTimeout(closeToast, duration);
}

function showLoading(message = "Processing...") {
  let modal = document.querySelector(".js-loading-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className =
      "js-loading-modal fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="bg-white dark:bg-[#0f1724] rounded-lg p-6 flex items-center gap-4 shadow-2xl transition-all duration-300 ease-in-out transform scale-95 opacity-0 -translate-y-4">
        <div class="loader w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
        <div class="text-base font-medium text-slate-700 dark:text-slate-200">${message}</div>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
      const inner = modal.querySelector("div");
      if (inner)
        inner.classList.remove("scale-95", "opacity-0", "-translate-y-4");
    }, 20);
  } else {
    modal.querySelector("div > div:last-child").textContent = message;
    modal.classList.remove("hidden");
    const inner = modal.querySelector("div");
    if (inner)
      inner.classList.remove("scale-95", "opacity-0", "-translate-y-4");
  }
}

function hideLoading() {
  const modal = document.querySelector(".js-loading-modal");
  if (!modal) return;
  const inner = modal.querySelector("div");

  if (inner) {
    inner.classList.add("scale-95", "opacity-0", "-translate-y-4");
    inner.addEventListener(
      "transitionend",
      () => {
        modal.classList.add("hidden");
      },
      { once: true },
    );
  } else {
    modal.classList.add("hidden");
  }
}

function createConfirmationPrompt(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4";

    const modalContent = document.createElement("div");
    modalContent.className =
      "bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-sm transition-all duration-300 ease-in-out transform scale-95 opacity-0 -translate-y-4";
    modalContent.innerHTML = `
        <div class="p-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Confirm Action</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">${message}</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-b-xl flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Confirm</button>
        </div>
    `;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0", "-translate-y-4");
    }, 20);

    const confirmBtn = modal.querySelector("#confirm-btn");
    const cancelBtn = modal.querySelector("#cancel-btn");

    const closeModal = (value) => {
      modalContent.classList.add("scale-95", "opacity-0", "-translate-y-4");
      modalContent.addEventListener(
        "transitionend",
        () => {
          document.body.removeChild(modal);
          resolve(value);
        },
        { once: true },
      );
    };

    confirmBtn.addEventListener("click", () => closeModal(true));
    cancelBtn.addEventListener("click", () => closeModal(false));
  });
}

export { showToast, showLoading, hideLoading, createConfirmationPrompt };