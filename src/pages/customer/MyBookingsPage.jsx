import { CheckCircle2, CalendarRange, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getBookings } from "../../api/bookingApi";
import {
  getSavedCustomerEmail,
  saveCustomerEmail,
} from "../../utils/customerStorage";

export default function MyBookingsPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(
    location.state?.email || getSavedCustomerEmail(),
  );
  const paymentSuccess = location.state?.paymentSuccess;
  const bookingCode = location.state?.bookingCode;
  const paymentCode = location.state?.paymentCode;

  useEffect(() => {
    if (email) {
      loadBookings(email);
    }
  }, []);

  async function loadBookings(targetEmail) {
    try {
      setLoading(true);
      setError("");
      const data = await getBookings(targetEmail);
      setBookings(data || []);
      saveCustomerEmail(targetEmail);
    } catch (err) {
      setError(err.message || "Cannot load bookings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {paymentSuccess && (
        <div className="mb-8 flex items-start gap-3 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-semibold">Payment completed successfully</p>
            <p className="text-sm">
              Booking {bookingCode} has been paid successfully with payment code{" "}
              {paymentCode}.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
          My Bookings
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-900">
          Your spa appointments
        </h1>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to view bookings"
            className="h-12 flex-1 rounded-full border border-stone-200 bg-stone-50 px-5 text-sm outline-none transition focus:border-rose-300"
          />
          <button
            type="button"
            onClick={() => loadBookings(email)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 rounded-[28px] border border-stone-200 bg-stone-50 p-10 text-center text-stone-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
            <CalendarRange className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-stone-600">
              No bookings found for this email yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[28px] border border-stone-200 p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-stone-900">
                        {booking.bookingCode}
                      </h2>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                        {booking.status}
                      </span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                        {booking.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-stone-600">
                      {booking.fullName} • {booking.phone} • {booking.email}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      Appointment: {booking.appointmentDate} at{" "}
                      {booking.appointmentTime}
                    </p>
                    <div className="mt-4 space-y-2">
                      {(booking.items || []).map((item) => (
                        <p
                          key={`${booking.id}-${item.serviceId}`}
                          className="text-sm text-stone-500"
                        >
                          {item.serviceName} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-stone-500">Total</p>
                    <p className="text-2xl font-semibold text-rose-600">
                      ${booking.totalAmount}
                    </p>
                    <p className="mt-4 text-xs text-stone-400">
                      Created at {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
