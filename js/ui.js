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

export { showToast };
