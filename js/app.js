const API_BASE = "/api";

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

export { apiFetch, postJSON, getJSON, putJSON, deleteJSON };
