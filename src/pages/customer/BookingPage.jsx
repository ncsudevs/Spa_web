import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../api/bookingApi";
import { readCart, saveCustomerEmail } from "../../utils/customerStorage";

// Time slots are currently static because availability is not managed by the backend yet.
const bookingTimeOptions = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
];

export default function BookingPage() {
  const navigate = useNavigate();
  const cart = readCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    date: "",
    time: bookingTimeOptions[0],
    note: "",
  });

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0),
    [cart],
  );

  // The booking screen requires a cart context. Missing cart data redirects the user back.
  if (!cart.length) {
    navigate("/cart");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      // The API payload only sends service IDs and quantities.
      // Pricing is recalculated on the server to avoid trusting client-side totals.
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        appointmentDate: form.date,
        appointmentTime: form.time,
        note: form.note.trim() || null,
        items: cart.map((item) => ({
          serviceId: item.service.id,
          quantity: item.quantity,
        })),
      };

      const booking = await createBooking(payload);

      // The latest customer email is cached locally so the bookings page can reload the same customer history.
      saveCustomerEmail(booking.email);

      navigate("/payment", {
        state: {
          booking,
        },
      });
    } catch (err) {
      setError(err.message || "Cannot create booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-4x1 bg-white p-8 shadow-sm lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            Booking
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">
            Complete your appointment details
          </h1>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            <Field label="Full name">
              <input
                required
                className="field"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Field>
            <Field label="Phone number">
              <input
                required
                className="field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Email address">
              <input
                required
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Appointment date">
              <input
                required
                type="date"
                className="field"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Preferred time">
              <select
                className="field"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                {bookingTimeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Note">
              <textarea
                rows="4"
                className="field"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </Field>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating booking..." : "Continue to payment"}
              </button>
            </div>
          </form>
        </section>

        <aside className="h-fit rounded-4x1 bg-stone-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Booking summary</h2>
          <div className="mt-6 space-y-4 text-sm text-stone-300">
            {cart.map((item) => (
              <div key={item.service.id} className="rounded-3xl bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">
                      {item.service.name}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      {item.service.duration} min • Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-rose-300">
                    ${item.service.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-lg font-semibold text-white">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  // Shared field wrapper keeps spacing and labels consistent across the form.
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
