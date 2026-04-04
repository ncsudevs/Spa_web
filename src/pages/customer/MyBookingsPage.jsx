import {
  CheckCircle2,
  CalendarRange,
  Landmark,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { createPayment } from "../../api/paymentApi";
import { getBookings } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/shared/StatusBadge";
import { clearCart } from "../../utils/customerStorage";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../utils/formatters";

const paymentMethods = [
  {
    id: "MOMO",
    label: "MoMo",
    icon: Wallet,
    description:
      "Create a real MoMo sandbox payment session and redirect to the hosted QR page.",
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank Transfer",
    icon: Landmark,
    description:
      "Create a bank transfer request and wait for admin confirmation.",
  },
];

export default function MyBookingsPage() {
  const location = useLocation();
  // const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [method, setMethod] = useState("MOMO");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const paymentSuccess = location.state?.paymentSuccess;
  const bookingCreated = location.state?.bookingCreated;
  const bookingCode = location.state?.bookingCode;
  const paymentCode = location.state?.paymentCode;

  function parseUtcDate(value) {
    if (!value) return null;
    const str = String(value);
    const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(str);
    return new Date(hasTz ? str : `${str}Z`);
  }

  useEffect(() => {
    loadBookings();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBooking = useMemo(
    () => bookings.find((item) => item.id === selectedBookingId) || null,
    [bookings, selectedBookingId],
  );

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await getBookings();
      setBookings(data || []);
    } catch (err) {
      setError(err.message || "Cannot load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePayment(booking) {
    try {
      setSubmittingPayment(true);
      setError("");
      const payment = await createPayment({
        bookingId: booking.id,
        method,
      });

      clearCart();
      setPaymentInfo(payment);
      setSelectedBookingId(booking.id);
      await loadBookings();

      if (method === "MOMO") {
        const hostedUrl =
          payment.payUrl || payment.qrCodeUrl || payment.deepLink;
        if (hostedUrl) {
          window.location.href = hostedUrl;
          return;
        }

        setError(
          "MoMo payment session was created but no hosted payment URL was returned by the server.",
        );
      }
    } catch (err) {
      setError(err.message || "Cannot create payment.");
    } finally {
      setSubmittingPayment(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {(paymentSuccess || bookingCreated || paymentInfo) && (
        <div className="mb-8 flex items-start gap-3 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-semibold">
              {paymentInfo || paymentSuccess
                ? "Payment request created"
                : "Booking created successfully"}
            </p>
            <p className="text-sm">
              {paymentInfo
                ? `Payment code ${paymentInfo.paymentCode} has been created for booking ${paymentInfo.bookingCode}.`
                : paymentSuccess
                  ? `Booking ${bookingCode} has created a payment request with payment code ${paymentCode}.`
                  : `Booking ${bookingCode} has been created. Review it here before starting payment.`}
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
        <p className="mt-3 text-stone-600">Signed in as {user?.email}</p>
        <p className="mt-2 text-sm text-stone-500">
          New flow: create the booking first, review it here, then start the
          payment request.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-[28px] border border-stone-200 bg-stone-50 p-5">
          <p className="font-semibold text-stone-900">Payment status guide</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>UNPAID: no payment request has been created yet.</li>
            <li>
              PENDING: the request was created and is waiting for admin
              confirmation.
            </li>
            <li>
              PAID: payment was confirmed and the booking automatically becomes
              CONFIRMED.
            </li>
            <li>
              REJECTED: the payment proof or transfer information was not
              accepted.
            </li>
          </ul>
        </div>

        {paymentInfo && selectedBooking ? (
          <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-stone-700">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Latest payment instruction
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  {paymentInfo.providerName}
                </h2>
              </div>
              <StatusBadge value={paymentInfo.status} />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm text-stone-500">
                  Wallet / account number
                </p>
                <p className="mt-1 font-semibold text-stone-900">
                  {paymentInfo.accountNumber}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm text-stone-500">Account holder</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {paymentInfo.accountName}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm text-stone-500">Transfer content</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {paymentInfo.paymentContent}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm text-stone-500">Amount</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {formatCurrency(paymentInfo.amount)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {paymentInfo.method === "MOMO" ? (
                <button
                  type="button"
                  onClick={() => {
                    const hostedUrl =
                      paymentInfo?.payUrl ||
                      paymentInfo?.qrCodeUrl ||
                      paymentInfo?.deepLink;
                    if (hostedUrl) window.location.href = hostedUrl;
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
                >
                  <ExternalLink className="h-4 w-4" />
                  Continue to hosted MoMo page
                </button>
              ) : null}
              <p className="text-sm text-stone-600">{paymentInfo.qrNote}</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-10 rounded-[28px] border border-stone-200 bg-stone-50 p-10 text-center text-stone-500">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-dashed border-stone-300 bg-stone-50 p-10 text-center">
            <CalendarRange className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-4 text-stone-600">
              No bookings found for your account yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {bookings.map((booking) => {
              const canPay = booking.paymentStatus === "UNPAID";
              const isPending = booking.paymentStatus === "PENDING";
              const isPaid = booking.paymentStatus === "PAID";
              const isRejected = booking.paymentStatus === "REJECTED";
              const isCancelled = booking.status === "CANCELLED";
              const paymentAttempts = booking.paymentAttempts ?? 0;
              const canRetryPending = paymentAttempts < 3;

              const appointmentDate = booking.appointmentDate
                ? new Date(booking.appointmentDate)
                : null;
              const isExpiredDate =
                appointmentDate &&
                appointmentDate < new Date(new Date(now).toDateString());

              const lastPaymentCreated = booking.lastPaymentCreatedAt
                ? parseUtcDate(booking.lastPaymentCreatedAt)
                : booking.updatedAt
                  ? parseUtcDate(booking.updatedAt)
                  : parseUtcDate(booking.createdAt);
              const expiresAt =
                lastPaymentCreated != null
                  ? // ? lastPaymentCreated.getTime() + 10 * 1000
                    lastPaymentCreated.getTime() + 1 * 60 * 1000
                  : null;
              const secondsLeft =
                expiresAt && expiresAt > now
                  ? Math.max(0, Math.floor((expiresAt - now) / 1000))
                  : 0;
              const countdown =
                secondsLeft > 0
                  ? `${Math.floor(secondsLeft / 60)
                      .toString()
                      .padStart(2, "0")}:${(secondsLeft % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : null;
              const isTtlExpired = expiresAt != null && expiresAt <= now;

              const canRetry =
                (isPending || isRejected || isCancelled || canPay) &&
                paymentAttempts < 3 &&
                !isExpiredDate;
              return (
                <article
                  key={booking.id}
                  className="rounded-[28px] border border-stone-200 p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-stone-900">
                          {booking.bookingCode}
                        </h2>
                        <span className="text-sm text-stone-500">
                          payment status:
                        </span>
                        <StatusBadge value={booking.paymentStatus} />
                        <span className="text-sm text-stone-500">
                          booking status:
                        </span>
                        <StatusBadge value={booking.status} />
                      </div>
                      <p className="mt-3 text-sm text-stone-600">
                        {booking.fullName} • {booking.phone} • {booking.email}
                      </p>
                      {booking.isGroupBooking ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                          Group booking • {booking.groupSize} people
                        </p>
                      ) : null}
                      <div className="mt-4 space-y-3">
                        {(booking.items || []).map((item, index) => (
                          <div
                            key={`${booking.id}-${item.serviceId}-${index}`}
                            className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600"
                          >
                            <p className="font-medium text-stone-900">
                              {item.serviceName}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {formatDate(item.appointmentDate)} at{" "}
                              {item.appointmentTime}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {item.quantity} x {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full max-w-sm rounded-[24px] border border-stone-200 p-4 lg:w-[320px]">
                      <p className="text-sm text-stone-500">Total</p>
                      <p className="text-2xl font-semibold text-rose-600">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                      <p className="mt-3 text-xs text-stone-400">
                        Created at {formatDateTime(booking.createdAt)}
                      </p>

                      {canPay || isRejected || isCancelled ? (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-stone-900">
                            Choose payment method
                          </p>
                          <div className="grid gap-3">
                            {paymentMethods.map((item) => {
                              const Icon = item.icon;
                              const selected =
                                selectedBookingId === booking.id &&
                                method === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBookingId(booking.id);
                                    setMethod(item.id);
                                  }}
                                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left ${selected ? "border-rose-300 bg-rose-50" : "border-stone-200"} ${!canRetry ? "opacity-50" : ""}`}
                                  disabled={!canRetry}
                                >
                                  <span className="mt-0.5 rounded-full bg-white p-2 shadow-sm">
                                    <Icon className="h-4 w-4 text-rose-500" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold text-stone-900">
                                      {item.label}
                                    </span>
                                    <span className="text-xs text-stone-500">
                                      {item.description}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCreatePayment(booking)}
                            disabled={submittingPayment || !canRetry}
                            className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
                          >
                            {submittingPayment &&
                            selectedBookingId === booking.id
                              ? "Creating request..."
                              : method === "MOMO"
                                ? "Pay with MoMo"
                                : "Create payment request"}
                          </button>
                          {!canRetry ? (
                            <p className="text-xs text-stone-500">
                              {isExpiredDate
                                ? "Appointment date has passed. Payment is disabled."
                                : `Retry limit reached (${paymentAttempts}/3).`}
                            </p>
                          ) : (
                            <p className="text-xs text-stone-500">
                              Attempts used: {paymentAttempts}/3.{" "}
                              {countdown
                                ? `MoMo session expires in ${countdown}.`
                                : isTtlExpired
                                  ? "Session expired; create a new payment to get a fresh QR."
                                  : "Session may be expired; click to get a new QR."}
                            </p>
                          )}
                        </div>
                      ) : isPending ? (
                        <div className="mt-4 space-y-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          <p className="text-xs text-amber-700">
                            Attempts used: {paymentAttempts}/3.
                          </p>

                          {isTtlExpired ? (
                            <div className="rounded-2xl bg-white p-4 text-amber-800 shadow-sm ring-1 ring-amber-200">
                              <p className="text-sm font-semibold">
                                Payment session expired
                              </p>
                              <p className="mt-1 text-xs text-amber-700">
                                The MoMo QR/session is only valid for 5 minutes.
                                Create a new payment to get a fresh QR.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCreatePayment(booking)}
                                disabled={submittingPayment || !canRetryPending}
                                className="mt-3 inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
                              >
                                {submittingPayment &&
                                selectedBookingId === booking.id
                                  ? "Creating new session..."
                                  : "Create new payment"}
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-semibold tracking-wide text-amber-700">
                                {countdown
                                  ? `MoMo session expires in ${countdown}.`
                                  : "Session time remaining unknown. If payment fails, create a new one."}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCreatePayment(booking)}
                                disabled={submittingPayment || !canRetryPending}
                                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
                              >
                                {submittingPayment &&
                                selectedBookingId === booking.id
                                  ? "Recreating session..."
                                  : "Resume MoMo payment"}
                              </button>
                            </>
                          )}
                        </div>
                      ) : isRejected ? (
                        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          This payment request was rejected. Please create a new
                          payment request.
                        </div>
                      ) : isPaid ? (
                        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                          Payment has been confirmed.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
