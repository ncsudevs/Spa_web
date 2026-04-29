import { http } from "../../../shared/api/http";

const BASE = import.meta.env.VITE_BASE_API + "/api/dashboard";

export function getDashboardSummary() {
  return http(`${BASE}/summary`);
}
