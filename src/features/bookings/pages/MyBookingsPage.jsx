import {
  CalendarRange,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getBookings } from "../api/bookingApi";
import {
  confirmBankTransfer,
  createPayment,
  getLatestPaymentForBooking,
} from "../../payments/api/paymentApi";
import AppButton from "../../../shared/components/AppButton";
import StatusBadge from "../../../shared/components/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { clearCart } from "../../../shared/utils/customerStorage";
import {
  getBookingStatusBadgeLabels,
  getBookingWorkflowLabel,
  getBookingWorkflowStatus,
} from "../utils/bookingWorkflow";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../../shared/utils/formatters";

const paymentMethods = [
  {
    id: "MOMO",
    label: "MoMo",
    icon: Wallet,
    description:
      "Create a real MoMo sandbox payment session and continue to the hosted QR page.",
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank transfer",
    icon: Landmark,
    description:
      "Transfer manually, then notify cashier so they can verify and confirm payment.",
  },
];

function parseUtcDate(value) {
  if (!value) return null;
  const str = String(value);
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(str);
  return new Date(hasTimezone ? str : `${str}Z`);
}

function isSuccessfulMomoReturn(resultCode) {
  return resultCode === "0";
}

function buildReturnNotice(location) {
  const searchParams = new URLSearchParams(location.search);
  const resultCode = searchParams.get("resultCode");
  const bookingCode = searchParams.get("bookingCode");
  const paymentCode = searchParams.get("paymentCode");
  const resultMessage = searchParams.get("message");

  if (resultCode != null) {
    return isSuccessfulMomoReturn(resultCode)
      ? {
          tone: "success",
          title: "MoMo payment finished",
          description: `Booking ${bookingCode || "-"} returned from MoMo successfully. Payment ${paymentCode || "-"} is being refreshed.`,
        }
      : {
          tone: "warning",
          title: "MoMo payment was not completed",
          description:
            resultMessage ||
            `Booking ${bookingCode || "-"} returned from MoMo with result code ${resultCode}.`,
        };
  }

  if (location.state?.paymentSuccess) {
    return {
      tone: "success",
      title: "Payment request created",
      description: `Booking ${location.state.bookingCode} created payment ${location.state.paymentCode}.`,
    };
  }

  if (location.state?.bookingCreated) {
    return {
      tone: "success",
      title: "Booking created successfully",
      description: `Booking ${location.state.bookingCode} has been created. Review it here before starting payment.`,
    };
  }

  return null;
}

function NoticeBanner({ notice }) {
  if (!notice) return null;

  const toneClass =
    notice.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div className={`mb-8 flex items-start gap-3 rounded-[28px] border p-5 ${toneClass}`}>
      <CheckCircle2 className="mt-0.5 h-5 w-5" />
      <div>
        <p className="font-semibold">{notice.title}</p>
        <p className="text-sm">{notice.description}</p>
      </div>
    </div>
  );
}

function PaymentInstructionCard({
  booking,
  payment,
  confirming,
  creating,
  canRetryPending,
  onConfirmTransfer,
  onResumeMomo,
}) {
  if (!payment) return null;

  const isMomo = payment.method === "MOMO";
  const isAwaitingTransfer = payment.status === "AWAITING_TRANSFER";
  const isPending = payment.status === "PENDING";
  const hostedUrl = payment.payUrl || payment.qrCodeUrl || payment.deepLink;

  return (
    <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Latest payment
          </p>
          <h3 className="mt-1 text-lg font-semibold text-stone-900">
            {payment.providerName}
          </h3>
        </div>
        <StatusBadge
          value={payment.status}
          labels={{ BANK_TRANSFER: "BANK TRANSFER" }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">Payment code</p>
          <p className="mt-1 font-semibold text-stone-900">{payment.paymentCode}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">Amount</p>
          <p className="mt-1 font-semibold text-stone-900">
            {formatCurrency(payment.amount)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">Account / wallet</p>
          <p className="mt-1 font-semibold text-stone-900">
            {payment.accountNumber || "-"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">Account holder</p>
          <p className="mt-1 font-semibold text-stone-900">
            {payment.accountName || "-"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 md:col-span-2">
          <p className="text-sm text-stone-500">Transfer content</p>
          <p className="mt-1 font-semibold text-stone-900">
            {payment.paymentContent}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-stone-600">{payment.qrNote}</p>
      <p className="mt-2 text-xs text-stone-400">
        Last update: {formatDateTime(payment.paidAt)}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {isMomo && hostedUrl ? (
          <AppButton
            variant="secondary"
            onClick={() => {
              window.location.href = hostedUrl;
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Continue to hosted MoMo page
          </AppButton>
        ) : null}

        {!isMomo && payment.customerCanConfirm ? (
          <AppButton
            variant="secondary"
            onClick={() => onConfirmTransfer(payment.id, booking.id)}
            disabled={confirming}
          >
            {confirming ? "Sending confirmation..." : "I have transferred, notify cashier"}
          </AppButton>
        ) : null}

        {isMomo && isPending ? (
          <AppButton
            variant="ghost"
            onClick={() => onResumeMomo(booking)}
            disabled={creating || !canRetryPending}
          >
            {creating ? "Refreshing session..." : "Create a fresh MoMo session"}
          </AppButton>
        ) : null}
      </div>

      {!isMomo && isAwaitingTransfer ? (
        <p className="mt-3 text-sm text-amber-700">
          Transfer first, then press the confirmation button so cashier can review it.
        </p>
      ) : null}

      {!isMomo && isPending ? (
        <p className="mt-3 text-sm text-sky-700">
          Cashier has been notified and will mark this booking as paid after checking the transfer.
        </p>
      ) : null}
    </div>
  );
}

export default function MyBookingsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [latestPayments, setLatestPayments] = useState({});
  const [selectedMethods, setSelectedMethods] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() => buildReturnNotice(location));
  const [creatingBookingId, setCreatingBookingId] = useState(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const locationNotice = useMemo(
    () => buildReturnNotice(location),
    [location],
  );

  useEffect(() => {
    setNotice(locationNotice);
  }, [locationNotice]);

  useEffect(() => {
    loadBookings();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await getBookings();
      const nextBookings = data || [];
      setBookings(nextBookings);
      syncSelectedMethods(nextBookings);
      await hydrateLatestPayments(nextBookings);
    } catch (err) {
      setError(err.message || "Cannot load bookings.");
    } finally {
      setLoading(false);
    }
  }

  function syncSelectedMethods(nextBookings) {
    setSelectedMethods((current) => {
      const next = { ...current };
      for (const booking of nextBookings) {
        if (!next[booking.id]) {
          next[booking.id] = booking.latestPaymentMethod || "MOMO";
        }
      }
      return next;
    });
  }

  async function hydrateLatestPayments(nextBookings) {
    const bookingsWithPayments = nextBookings.filter((booking) => booking.latestPaymentId);

    if (bookingsWithPayments.length === 0) {
      setLatestPayments({});
      return;
    }

    const results = await Promise.allSettled(
      bookingsWithPayments.map((booking) => getLatestPaymentForBooking(booking.id)),
    );

    const paymentMap = {};
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        paymentMap[bookingsWithPayments[index].id] = result.value;
      }
    });

    setLatestPayments(paymentMap);
  }

  function getSelectedMethod(booking) {
    return (
      selectedMethods[booking.id] ||
      latestPayments[booking.id]?.method ||
      booking.latestPaymentMethod ||
      "MOMO"
    );
  }

  async function handleCreatePayment(booking) {
    const method = getSelectedMethod(booking);

    try {
      setCreatingBookingId(booking.id);
      setError("");

      const payment = await createPayment({
        bookingId: booking.id,
        method,
      });

      clearCart();
      setLatestPayments((current) => ({ ...current, [booking.id]: payment }));
      setNotice({
        tone: "success",
        title:
          method === "MOMO"
            ? "MoMo payment session created"
            : "Bank transfer instruction created",
        description:
          method === "MOMO"
            ? `Payment ${payment.paymentCode} is ready. Continue to the hosted MoMo page to scan the QR code.`
            : `Payment ${payment.paymentCode} is ready. Transfer using the account info below, then confirm the transfer.`,
      });

      await loadBookings();

      if (method === "MOMO") {
        const hostedUrl = payment.payUrl || payment.qrCodeUrl || payment.deepLink;

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
      setCreatingBookingId(null);
    }
  }

  async function handleConfirmTransfer(paymentId, bookingId) {
    try {
      setConfirmingPaymentId(paymentId);
      setError("");
      const updatedPayment = await confirmBankTransfer(paymentId);
      setLatestPayments((current) => ({ ...current, [bookingId]: updatedPayment }));
      setNotice({
        tone: "success",
        title: "Cashier has been notified",
        description: `Payment ${updatedPayment.paymentCode} is now waiting for cashier review.`,
      });
      await loadBookings();
    } catch (err) {
      setError(err.message || "Cannot confirm transfer.");
    } finally {
      setConfirmingPaymentId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <NoticeBanner notice={notice} />

      <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
              My Bookings
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900">
              Your spa appointments
            </h1>
            <p className="mt-3 text-stone-600">Signed in as {user?.email}</p>
            <p className="mt-2 text-sm text-stone-500">
              Create the booking first, then choose how you want to pay for each booking here.
            </p>
          </div>

          <AppButton variant="ghost" onClick={loadBookings} disabled={loading}>
            Refresh
          </AppButton>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 rounded-[28px] border border-stone-200 bg-stone-50 p-5">
          <p className="font-semibold text-stone-900">Payment status guide</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>UNPAID: no payment request has been created yet.</li>
            <li>AWAITING_TRANSFER: bank transfer instruction is ready and waiting for your confirmation.</li>
            <li>PENDING: the payment is waiting for cashier review or MoMo completion.</li>
            <li>PAID: payment was confirmed and the booking automatically becomes CONFIRMED.</li>
            <li>REJECTED: the payment request was rejected and you can create a new one.</li>
          </ul>
        </div>

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
              const workflowStatus = getBookingWorkflowStatus(booking);
              const workflowLabel = getBookingWorkflowLabel(booking);
              const latestPayment = latestPayments[booking.id] || null;
              const selectedMethod = getSelectedMethod(booking);
              const canPay = booking.paymentStatus === "UNPAID";
              const isAwaitingTransfer = booking.paymentStatus === "AWAITING_TRANSFER";
              const isPending = booking.paymentStatus === "PENDING";
              const isPaid = booking.paymentStatus === "PAID";
              const isRejected = booking.paymentStatus === "REJECTED";
              const isCancelled = booking.status === "CANCELLED";
              const isMomoPending = isPending && latestPayment?.method === "MOMO";
              const isBankPending =
                isAwaitingTransfer ||
                (isPending && latestPayment?.method === "BANK_TRANSFER");

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
                  ? lastPaymentCreated.getTime() + 5 * 60 * 1000
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

              const canCreateNewPayment =
                !isExpiredDate &&
                !isPaid &&
                !isAwaitingTransfer &&
                (!isPending || latestPayment?.method === "MOMO");

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
                          booking stage:
                        </span>
                        <StatusBadge
                          value={workflowStatus}
                          labels={getBookingStatusBadgeLabels(booking)}
                        />
                      </div>

                      <p className="mt-3 text-sm text-stone-600">
                        {booking.fullName} - {booking.phone} - {booking.email}
                      </p>
                      <p className="mt-2 text-sm text-stone-500">
                        Current booking stage: {workflowLabel}
                      </p>

                      {booking.isGroupBooking ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                          Group booking - {booking.groupSize} people
                        </p>
                      ) : null}

                      <div className="mt-4 space-y-3">
                        {(booking.items || []).map((item, index) => (
                          <div
                            key={`${booking.id}-${item.detailId || item.serviceId}-${index}`}
                            className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600"
                          >
                            <p className="font-medium text-stone-900">
                              {item.serviceName}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {formatDate(item.appointmentDate)} at {item.appointmentTime}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              {item.quantity} x {formatCurrency(item.unitPrice)}
                            </p>
                            {item.staffAssignments?.length ? (
                              <div className="mt-2 space-y-1">
                                {item.staffAssignments.map((assignment) => (
                                  <p
                                    key={assignment.id}
                                    className="text-xs text-emerald-700"
                                  >
                                    Staff: {assignment.staffName} ({assignment.assignedQuantity}/{item.quantity})
                                  </p>
                                ))}
                              </div>
                            ) : null}
                            {item.unassignedQuantity > 0 ? (
                              <p className="mt-2 text-xs text-amber-700">
                                {item.staffingWarning ||
                                  `Staffing is still being arranged for ${item.unassignedQuantity} slot(s).`}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      {booking.staffingWarning ? (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          {booking.staffingWarning}
                        </div>
                      ) : null}

                      {booking.isCheckedIn ? (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                          Checked in
                          {booking.checkedInAt
                            ? ` at ${formatDateTime(booking.checkedInAt)}`
                            : "."}
                        </div>
                      ) : null}

                      <PaymentInstructionCard
                        booking={booking}
                        payment={latestPayment}
                        confirming={confirmingPaymentId === latestPayment?.id}
                        creating={creatingBookingId === booking.id}
                        canRetryPending={canRetryPending}
                        onConfirmTransfer={handleConfirmTransfer}
                        onResumeMomo={handleCreatePayment}
                      />
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
                              const selected = selectedMethod === item.id;

                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedMethods((current) => ({
                                      ...current,
                                      [booking.id]: item.id,
                                    }))
                                  }
                                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left ${
                                    selected
                                      ? "border-rose-300 bg-rose-50"
                                      : "border-stone-200"
                                  } ${!canCreateNewPayment ? "opacity-50" : ""}`}
                                  disabled={!canCreateNewPayment}
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

                          <AppButton
                            variant="secondary"
                            className="w-full rounded-full"
                            onClick={() => handleCreatePayment(booking)}
                            disabled={creatingBookingId === booking.id || !canCreateNewPayment}
                          >
                            {creatingBookingId === booking.id
                              ? "Creating request..."
                              : selectedMethod === "MOMO"
                                ? "Pay with MoMo"
                                : "Create bank transfer instruction"}
                          </AppButton>

                          {!canCreateNewPayment ? (
                            <p className="text-xs text-stone-500">
                              {isExpiredDate
                                ? "Appointment date has passed. Payment is disabled."
                                : isPaid
                                  ? "Payment is already complete."
                                  : isAwaitingTransfer
                                    ? "Confirm the existing bank transfer before creating a new request."
                                    : "Finish or refresh the current MoMo request first."}
                            </p>
                          ) : selectedMethod === "MOMO" ? (
                            <p className="text-xs text-stone-500">
                              Attempts used: {paymentAttempts}/3.{" "}
                              {countdown
                                ? `MoMo session expires in ${countdown}.`
                                : isTtlExpired
                                  ? "Previous session expired; create a new payment to get a fresh QR."
                                  : "A fresh QR will be created after you continue."}
                            </p>
                          ) : (
                            <p className="text-xs text-stone-500">
                              We will create a transfer instruction and wait for you to confirm after sending the money.
                            </p>
                          )}
                        </div>
                      ) : isMomoPending ? (
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
                                The MoMo QR/session is only valid for 5 minutes. Create a new payment to get a fresh QR.
                              </p>
                              <AppButton
                                variant="secondary"
                                className="mt-3 rounded-full"
                                onClick={() => handleCreatePayment(booking)}
                                disabled={creatingBookingId === booking.id || !canRetryPending}
                              >
                                {creatingBookingId === booking.id
                                  ? "Creating new session..."
                                  : "Create new payment"}
                              </AppButton>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-semibold tracking-wide text-amber-700">
                                {countdown
                                  ? `MoMo session expires in ${countdown}.`
                                  : "Session time remaining unknown. If payment fails, create a new one."}
                              </p>
                              <AppButton
                                variant="secondary"
                                className="rounded-full"
                                onClick={() => handleCreatePayment(booking)}
                                disabled={creatingBookingId === booking.id || !canRetryPending}
                              >
                                {creatingBookingId === booking.id
                                  ? "Recreating session..."
                                  : "Create new MoMo session"}
                              </AppButton>
                            </>
                          )}
                        </div>
                      ) : isBankPending ? (
                        <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                          {isAwaitingTransfer
                            ? "Use the bank transfer details above, then confirm the transfer."
                            : "Transfer confirmation was sent to cashier. They will update the status after review."}
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
