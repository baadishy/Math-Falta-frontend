const API_BASE =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE) ||
  window.__API_BASE__ ||
  "/api";

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  options.credentials = options.credentials || "include";
  options.headers = options.headers || {};
  if (options.body && !(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";

  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const err = new Error(data?.msg || res.statusText);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

async function postJSON(path, body) {
  return apiFetch(path, { method: "POST", body });
}

async function getJSON(path) {
  return apiFetch(path, { method: "GET" });
}

async function putJSON(path, body) {
  return apiFetch(path, { method: "PUT", body });
}

async function deleteJSON(path) {
  return apiFetch(path, { method: "DELETE" });
}

// ---- PWA: install prompt + update notifications ----
let deferredInstallPrompt = null;
const installButton = document.getElementById("install-btn");
const updateToast = document.getElementById("update-toast");
const refreshBtn = document.getElementById("refresh-btn");

function hideInstallButton() {
  if (installButton) installButton.style.display = "none";
}

if (installButton) {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.style.display = "inline-flex";
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    hideInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    hideInstallButton();
  });
}

function wireUpdateFlow(registration) {
  if (registration.waiting) {
    showUpdateToast(registration.waiting);
  }
  registration.addEventListener("updatefound", () => {
    const newWorker = registration.installing;
    newWorker?.addEventListener("statechange", () => {
      if (
        newWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        showUpdateToast(newWorker);
      }
    });
  });
}

function showUpdateToast(worker) {
  if (!updateToast || !refreshBtn) return;
  updateToast.style.display = "inline-flex";
  refreshBtn.onclick = () => worker.postMessage({ type: "SKIP_WAITING" });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        wireUpdateFlow(registration);
      })
      .catch((err) => console.error("SW registration failed", err));
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

export { API_BASE, apiFetch, postJSON, getJSON, putJSON, deleteJSON };
