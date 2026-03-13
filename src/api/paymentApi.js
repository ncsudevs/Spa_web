import { http } from "./http";

// Payment requests are kept explicit because payment is the last step in the customer flow.
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
