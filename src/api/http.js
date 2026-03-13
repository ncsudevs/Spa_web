// Centralized fetch wrapper used across the frontend.
// The helper keeps request/response handling consistent and normalizes API errors
// into regular JavaScript Error objects that page components can render directly.
export async function http(url, options = {}) {
  // FormData requests must allow the browser to set the multipart boundary automatically.
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      const message =
        json?.message ||
        json?.title ||
        JSON.stringify(json) ||
        `HTTP ${res.status}`;
      throw new Error(message);
    }

    const errText = await res.text().catch(() => "");
    throw new Error(errText || `HTTP ${res.status}`);
  }

  // NoContent endpoints are treated as successful operations with no payload.
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return await res.json();
  return await res.text();
}
