import { http } from "../../../shared/api/http";

const BASE = import.meta.env.VITE_BASE_API + "/api/staff";

export function getStaff() {
  return http(BASE);
}

export function getStaffById(id) {
  return http(`${BASE}/${id}`);
}

export function createStaff(payload) {
  return http(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateStaff(id, payload) {
  return http(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteStaff(id) {
  return http(`${BASE}/${id}`, { method: "DELETE" });
}

export function bulkUpdateStaffStatus(ids, status) {
  return http(`${BASE}/bulk/status`, {
    method: "PATCH",
    body: JSON.stringify({ ids, status }),
  });
}
