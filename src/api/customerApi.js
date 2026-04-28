import { http } from "./http";

const BASE = import.meta.env.VITE_BASE_API + "/api/customers";

export function getCustomers() {
  return http(BASE);
}

export function getCustomerById(id) {
  return http(`${BASE}/${id}`);
}

export function updateCustomer(id, payload) {
  return http(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomer(id) {
  return http(`${BASE}/${id}`, { method: "DELETE" });
}
