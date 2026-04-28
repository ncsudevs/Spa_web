import { clearAuth, getToken } from "../utils/authStorage";

export async function http(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const token = getToken();

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      const message =
        json?.message ||
        json?.title ||
        JSON.stringify(json) ||
        `HTTP ${res.status}`;
      const error = new Error(message);
      error.status = res.status;
      error.payload = json;
      throw error;
    }

    const errText = await res.text().catch(() => "");
    const error = new Error(errText || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return await res.json();
  return await res.text();
}
