import { http } from "../../../shared/api/http";

const BASE = import.meta.env.VITE_BASE_API + '/api/services';

function buildServiceFormData(payload) {
  const formData = new FormData();

  formData.append('name', payload.name);
  formData.append('description', payload.description ?? '');
  formData.append('price', String(payload.price));
  formData.append('duration', String(payload.duration));
  formData.append('status', payload.status || 'ACTIVE');
  formData.append('slotCapacity', String(payload.slotCapacity || 5));
  formData.append('categoryId', String(payload.categoryId));

  if (payload.imageFile) {
    formData.append('imageFile', payload.imageFile);
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
    method: 'POST',
    body: buildServiceFormData(payload),
  });
}

export function updateService(id, payload) {
  return http(`${BASE}/${id}`, {
    method: 'PUT',
    body: buildServiceFormData(payload),
  });
}

export function deleteService(id) {
  return http(`${BASE}/${id}`, { method: 'DELETE' });
}

export function bulkUpdateServiceStatus(ids, status) {
  return http(`${BASE}/bulk/status`, {
    method: 'PATCH',
    body: JSON.stringify({ ids, status }),
  });
}
