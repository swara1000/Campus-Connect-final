import { API_BASE_URL } from "./api-config.js";

export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`,
    { ...options, headers }
  );

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }

  return response;
}

export async function adminJson(path, options = {}) {
  const response = await adminFetch(path, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export function adminToken() {
  return localStorage.getItem("adminToken");
}
