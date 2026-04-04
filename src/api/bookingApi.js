import { http } from "./http";

const BASE = import.meta.env.VITE_BASE_API + "/api/bookings";

export function getBookings(email) {
  const url = email ? `${BASE}?email=${encodeURIComponent(email)}` : BASE;
  return http(url);
}

export function getBookingById(id) {
  return http(`${BASE}/${id}`);
}

export function getSlotAvailability({ serviceId, appointmentDate, appointmentTime }) {
  const params = new URLSearchParams({
    serviceId: String(serviceId),
    appointmentDate,
    appointmentTime,
  });

  return http(`${BASE}/availability?${params.toString()}`);
}

export function createBooking(payload) {
  return http(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBookingStatus(id, status) {
  return http(`${BASE}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteBooking(id) {
  return http(`${BASE}/${id}`, {
    method: "DELETE",
  });
}
