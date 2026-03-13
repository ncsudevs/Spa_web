import { http } from "./http";

// Service endpoints are kept in a dedicated module so page components stay focused on UI logic.
const BASE = import.meta.env.VITE_BASE_API + "/api/services";

function buildServiceFormData(payload) {
  const formData = new FormData();

  // FormData is required because the create/update endpoints support optional image upload.
  formData.append("name", payload.name);
  formData.append("description", payload.description ?? "");
  formData.append("price", String(payload.price));
  formData.append("duration", String(payload.duration));
  formData.append("status", payload.status || "ACTIVE");
  formData.append("categoryId", String(payload.categoryId));

  if (payload.imageFile) {
    formData.append("imageFile", payload.imageFile);
  }

  return formData;
}

export function getServices(categoryId) {
  const url = categoryId ? `${BASE}?categoryId=${categoryId}` : BASE;
  return http(url);
}

export function getServiceById(id) {
  return http(`${BASE}/${id}`);
}

export function createService(payload) {
  return http(BASE, {
    method: "POST",
    body: buildServiceFormData(payload),
  });
}

export function updateService(id, payload) {
  return http(`${BASE}/${id}`, {
    method: "PUT",
    body: buildServiceFormData(payload),
  });
}

export function deleteService(id) {
  return http(`${BASE}/${id}`, { method: "DELETE" });
}
