const AUTH_KEY = "spa_auth";

export function readAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("authChanged"));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("authChanged"));
}

export function getToken() {
  return readAuth()?.token || "";
}

export function getCurrentUser() {
  return readAuth()?.user || null;
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}
