const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export { API_BASE_URL };

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Cannot connect to the backend at ${API_BASE_URL}. Check that FastAPI is running and the API URL is correct.`
    );
  }

  let data = null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { detail: text } : null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export async function checkBackendHealth() {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/health`);
  } catch {
    throw new Error(
      `Cannot connect to the backend at ${API_BASE_URL}.`
    );
  }

  if (!response.ok) {
    throw new Error("Backend health check failed.");
  }

  return response.json();
}