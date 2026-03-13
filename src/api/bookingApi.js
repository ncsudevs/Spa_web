import { http } from "./http";

// Booking API calls are isolated so the booking flow can be reused by customer and admin pages.
const BASE = import.meta.env.VITE_BASE_API + "/api/bookings";

export function getBookings(email) {
  const url = email ? `${BASE}?email=${encodeURIComponent(email)}` : BASE;
  return http(url);
}

export function getBookingById(id) {
  return http(`${BASE}/${id}`);
}

export function createBooking(payload) {
  return http(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
