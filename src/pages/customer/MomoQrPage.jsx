import { ArrowLeft, CheckCircle2, Clock3, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { getBookings } from "../../api/bookingApi";

export default function MomoQrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resultCode = searchParams.get("resultCode");
  const message =
    searchParams.get("message") ||
    "Waiting for the latest payment status from the server.";
  const bookingCode =
    searchParams.get("bookingCode") || location.state?.bookingCode || "";
  const paymentCode =
    searchParams.get("paymentCode") || location.state?.paymentCode || "";

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        setLoading(true);
        const data = await getBookings();
        if (!ignore) {
          setBookings(data || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Cannot load your latest bookings.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBookings();
    const timer = window.setInterval(loadBookings, 5000);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, []);

  const booking = useMemo(
    () => bookings.find((item) => item.bookingCode === bookingCode) || null,
    [bookings, bookingCode],
  );

  const statusTone =
    booking?.paymentStatus === "PAID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : booking?.paymentStatus === "REJECTED"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate("/my-bookings")}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Bookings
      </button>

      <div className="mt-6 rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-600">
              MoMo return
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-stone-900">
              Payment status after redirect
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-stone-500">
              MoMo has redirected the customer back to your website. The final
              booking state should rely on the server-side IPN update, so this
              page keeps checking the latest data automatically.
            </p>
          </div>
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Open bookings
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-stone-200 p-5">
            <p className="text-sm text-stone-500">Booking code</p>
            <p className="mt-1 text-xl font-semibold text-stone-900">
              {bookingCode || "Unknown"}
            </p>
          </div>
          <div className="rounded-[24px] border border-stone-200 p-5">
            <p className="text-sm text-stone-500">Payment code</p>
            <p className="mt-1 text-xl font-semibold text-stone-900">
              {paymentCode || "Unknown"}
            </p>
          </div>
        </div>

        <div className={`mt-6 rounded-[24px] border p-5 ${statusTone}`}>
          <div className="flex items-center gap-3">
            {booking?.paymentStatus === "PAID" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Clock3 className="h-5 w-5" />
            )}
            <div>
              <p className="font-semibold">
                Current payment status: {booking?.paymentStatus || "PENDING"}
              </p>
              <p className="text-sm opacity-90">
                MoMo redirect result code: {resultCode || "N/A"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm opacity-90">{message}</p>
        </div>

        {loading ? (
          <div className="mt-6 rounded-[24px] bg-stone-50 px-5 py-4 text-sm text-stone-600">
            Refreshing booking data...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : booking ? (
          <div className="mt-6 rounded-[24px] border border-stone-200 p-5 text-sm text-stone-600">
            <p>
              <span className="font-semibold text-stone-900">
                Booking status:
              </span>{" "}
              {booking.status}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-stone-900">Customer:</span>{" "}
              {booking.fullName}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-stone-900">Email:</span>{" "}
              {booking.email}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-stone-900">
                Payment status:
              </span>{" "}
              {booking.paymentStatus}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            The booking has not been found in the refreshed list yet. Open My
            Bookings to verify the latest state.
          </div>
        )}
      </div>
    </div>
  );
}
