import { clearAuth, getToken } from "../utils/authStorage";

function sanitizeServerErrorMessage(status, message) {
  const normalized = String(message || "").trim();

  if (!normalized) {
    return status >= 500
      ? "The server hit an internal error. Please try again."
      : `HTTP ${status}`;
  }

  const looksLikeStackTrace =
    normalized.includes("System.") ||
    normalized.includes(" at ") ||
    normalized.includes("HEADERS =======") ||
    normalized.includes("<html");

  if (status >= 500 && (looksLikeStackTrace || normalized.length > 300)) {
    return "The server hit an internal error while processing your request. Please try again.";
  }

  return normalized;
}

export async function http(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const token = getToken();

  // Attach JSON and auth headers by default so feature APIs only need to
  // provide the endpoint and payload.
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const error = new Error(
      "Network error. Please check your connection and try again.",
    );
    error.cause = err;
    error.isNetworkError = true;
    throw error;
  }

  if (!res.ok) {
    if (res.status === 401) {
      // Any unauthorized response invalidates the local session to avoid
      // leaving the UI in a half-authenticated state.
      clearAuth();
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      const rawMessage =
        json?.message ||
        json?.title ||
        JSON.stringify(json) ||
        `HTTP ${res.status}`;
      const error = new Error(
        sanitizeServerErrorMessage(res.status, rawMessage),
      );
      error.status = res.status;
      error.payload = json;
      throw error;
    }

    const errText = await res.text().catch(() => "");
    const error = new Error(
      sanitizeServerErrorMessage(res.status, errText || `HTTP ${res.status}`),
    );
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return await res.json();
  return await res.text();
}
