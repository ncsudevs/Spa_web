import { http } from "./http";

const BASE = import.meta.env.VITE_BASE_API + "/api/payments";

export function getPayments() {
  return http(BASE);
}

export function getPaymentById(id) {
  return http(`${BASE}/${id}`);
}

export function createPayment(payload) {
  return http(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePaymentStatus(id, status) {
  return http(`${BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deletePayment(id) {
  return http(`${BASE}/${id}`, {
    method: "DELETE",
  });
}
