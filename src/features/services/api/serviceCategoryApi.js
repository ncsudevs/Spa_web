import { http } from "../../../shared/api/http";

// Category APIs are intentionally small and map 1:1 with the ASP.NET endpoints.
const BASE = import.meta.env.VITE_BASE_API + "/api/service-categories";

export function getCategories() {
  return http(BASE);
}

export function createCategory(payload) {
  return http(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id, payload) {
  return http(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id) {
  return http(`${BASE}/${id}`, { method: "DELETE" });
}
