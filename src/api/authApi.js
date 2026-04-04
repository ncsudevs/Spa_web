import { http } from "./http";

const BASE = import.meta.env.VITE_BASE_API + "/api/auth";

export function register(payload) {
  return http(`${BASE}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return http(`${BASE}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return http(`${BASE}/me`);
}
