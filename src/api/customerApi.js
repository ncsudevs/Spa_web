import { http } from "./http";

const BASE = import.meta.env.VITE_BASE_API + "/api/customers";

export function getCustomers() {
  return http(BASE);
}

export function getCustomerById(id) {
  return http(`${BASE}/${id}`);
}
