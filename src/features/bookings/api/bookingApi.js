import { http } from "../../../shared/api/http";

const BASE = import.meta.env.VITE_BASE_API + "/api/bookings";

export function getBookings(email) {
  const url = email ? `${BASE}?email=${encodeURIComponent(email)}` : BASE;
  return http(url);
}

export function getBookingById(id) {
  return http(`${BASE}/${id}`);
}

export function getSlotAvailability({
  serviceId,
  appointmentDate,
  appointmentTime,
  quantity,
}) {
  const params = new URLSearchParams({
    serviceId: String(serviceId),
    appointmentDate,
    appointmentTime,
  });

  if (quantity != null) {
    params.set("quantity", String(quantity));
  }

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

export function updateBookingCheckIn(id, isCheckedIn) {
  return http(`${BASE}/${id}/check-in`, {
    method: "PATCH",
    body: JSON.stringify({ isCheckedIn }),
  });
}

export function createBookingDetailStaffAssignment(detailId, payload) {
  return http(`${BASE}/details/${detailId}/staff-assignments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBookingDetailStaffAssignment(detailId, assignmentId, payload) {
  return http(`${BASE}/details/${detailId}/staff-assignments/${assignmentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteBookingDetailStaffAssignment(detailId, assignmentId) {
  return http(`${BASE}/details/${detailId}/staff-assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

export function deleteBooking(id) {
  return http(`${BASE}/${id}`, {
    method: "DELETE",
  });
}
