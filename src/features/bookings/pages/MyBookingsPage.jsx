import {
  CalendarRange,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getBookings } from "../api/bookingApi";
import {
  confirmBankTransfer,
  createPayment,
  getLatestPaymentForBooking,
} from "../../payments/api/paymentApi";
import { useToast } from "../../../context/useToast";
import AppButton from "../../../shared/components/AppButton";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import SkeletonBlock from "../../../shared/components/SkeletonBlock";
import StatusBadge from "../../../shared/components/StatusBadge";
import { useAuth } from "../../../context/useAuth";
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
      "Continue to the MoMo payment page and finish the payment there.",
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank transfer",
    icon: Landmark,
    description:
      "View the bank details, make the transfer, and confirm once it has been sent.",
  },
];

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
          description: `We received your MoMo return for booking ${bookingCode || "-"}. Payment ${paymentCode || "-"} will update here shortly.`,
        }
      : {
          tone: "warning",
          title: "MoMo payment was not completed",
          description:
            resultMessage ||
            `Your MoMo payment for booking ${bookingCode || "-"} was not completed. You can continue with MoMo or switch to bank transfer below.`,
        };
  }

  if (location.state?.paymentSuccess) {
    return {
      tone: "success",
      title: "Payment request created",
      description: `Payment ${location.state.paymentCode} has been created for booking ${location.state.bookingCode}.`,
    };
  }

  if (location.state?.bookingCreated) {
    return {
      tone: "success",
      title: "Booking created successfully",
      description: `Booking ${location.state.bookingCode} is ready. Review it here and choose your payment method when you are ready.`,
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
  onConfirmTransfer,
  onResumeMomo,
}) {
  if (!payment) return null;

  const isMomo = payment.method === "MOMO";
  const isAwaitingTransfer = payment.status === "AWAITING_TRANSFER";
  const isPending = payment.status === "PENDING";
  const hostedUrl = payment.payUrl || payment.qrCodeUrl || payment.deepLink;
  const isRefunded = payment.status === "REFUNDED";

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
        {isMomo && isPending ? (
          <AppButton
            variant="secondary"
            onClick={() => {
              if (hostedUrl) {
                window.location.href = hostedUrl;
                return;
              }

              onResumeMomo(booking);
            }}
            disabled={creating}
          >
            <ExternalLink className="h-4 w-4" />
            {creating ? "Preparing MoMo payment..." : "Continue to payment with MoMo"}
          </AppButton>
        ) : null}

        {!isMomo && payment.customerCanConfirm ? (
          <AppButton
            variant="secondary"
            onClick={() => onConfirmTransfer(payment.id, booking.id)}
            disabled={confirming}
          >
            {confirming ? "Sending confirmation..." : "I've transferred, confirm payment"}
          </AppButton>
        ) : null}
      </div>

      {!isMomo && isAwaitingTransfer ? (
        <p className="mt-3 text-sm text-amber-700">
          Transfer first, then press confirm so our team can review your payment.
        </p>
      ) : null}

      {isRefunded ? (
        <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          <p>This payment was refunded and the booking was cancelled.</p>
          {payment.refundReason ? (
            <p className="mt-1 text-xs">Reason: {payment.refundReason}</p>
          ) : null}
        </div>
      ) : null}

      {!isMomo && isPending ? (
        <p className="mt-3 text-sm text-sky-700">
          We have received your confirmation and will review the transfer shortly.
        </p>
      ) : null}
    </div>
  );
}

function BookingListSkeleton() {
  return (
    <div className="mt-10 space-y-5">
      {Array.from({ length: 2 }).map((_, index) => (
        <article
          key={index}
          className="rounded-[28px] border border-stone-200 bg-white p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <SkeletonBlock className="h-8 w-36" />
                <SkeletonBlock className="h-6 w-24 rounded-full" />
                <SkeletonBlock className="h-6 w-24 rounded-full" />
              </div>
              <SkeletonBlock className="mt-4 h-4 w-4/5" />
              <SkeletonBlock className="mt-3 h-4 w-2/3" />

              <div className="mt-5 space-y-3">
                {Array.from({ length: 2 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="rounded-2xl bg-stone-50 px-4 py-3"
                  >
                    <SkeletonBlock className="h-5 w-40" />
                    <SkeletonBlock className="mt-3 h-4 w-32" />
                    <SkeletonBlock className="mt-2 h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-stone-200 p-4 lg:w-[320px]">
              <SkeletonBlock className="h-4 w-12" />
              <SkeletonBlock className="mt-3 h-8 w-28" />
              <SkeletonBlock className="mt-4 h-4 w-32" />
              <div className="mt-5 space-y-3">
                <SkeletonBlock className="h-20 rounded-[22px]" />
                <SkeletonBlock className="h-20 rounded-[22px]" />
                <SkeletonBlock className="h-12 rounded-full" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function MyBookingsPage() {
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [latestPayments, setLatestPayments] = useState({});
  const [selectedMethods, setSelectedMethods] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(() => buildReturnNotice(location));
  const [creatingBookingId, setCreatingBookingId] = useState(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState(null);

  const locationNotice = useMemo(
    () => buildReturnNotice(location),
    [location],
  );

  useEffect(() => {
    setNotice(locationNotice);
  }, [locationNotice]);

  const syncSelectedMethods = useCallback((nextBookings) => {
    setSelectedMethods((current) => {
      const next = { ...current };
      for (const booking of nextBookings) {
        if (!next[booking.id]) {
          next[booking.id] = booking.latestPaymentMethod || "MOMO";
        }
      }
      return next;
    });
  }, []);

  const hydrateLatestPayments = useCallback(async (nextBookings) => {
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
  }, []);

  const loadBookings = useCallback(async () => {
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
  }, [hydrateLatestPayments, syncSelectedMethods]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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
            ? "MoMo payment is ready"
            : "Bank transfer instruction created",
        description:
          method === "MOMO"
            ? `Payment ${payment.paymentCode} is ready. Continue to MoMo to finish paying for this booking.`
            : `Payment ${payment.paymentCode} is ready. Use the bank details below, then confirm after you have transferred.`,
      });
      toast.success(
        method === "MOMO" ? "MoMo payment is ready" : "Bank transfer is ready",
        method === "MOMO"
          ? `Payment ${payment.paymentCode} is ready and you will continue to MoMo next.`
          : `Payment ${payment.paymentCode} is ready. Review the transfer details below.`,
      );

      await loadBookings();

      if (method === "MOMO") {
        const hostedUrl = payment.payUrl || payment.qrCodeUrl || payment.deepLink;

      if (hostedUrl) {
          window.location.href = hostedUrl;
          return;
        }

        const message =
          "We could not reopen MoMo right now. Please try again or choose bank transfer.";
        setError(message);
        toast.warning(
          "MoMo is temporarily unavailable",
          message,
        );
      }
    } catch (err) {
      const message = err.message || "Cannot create payment.";
      setError(message);
      toast.error("Payment could not be created", message);
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
        title: "Transfer confirmation received",
        description: `Payment ${updatedPayment.paymentCode} is now waiting for review.`,
      });
      toast.success(
        "Transfer confirmation received",
        `Payment ${updatedPayment.paymentCode} is now waiting for review.`,
      );
      await loadBookings();
    } catch (err) {
      const message = err.message || "Cannot confirm transfer.";
      setError(message);
      toast.error("Transfer confirmation failed", message);
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
              Bookings & Payment
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900">
              Your bookings and payment status
            </h1>
            <p className="mt-3 text-stone-600">Signed in as {user?.email}</p>
            <p className="mt-2 text-sm text-stone-500">
              Review each booking here and complete payment whenever you are ready.
            </p>
          </div>

          <AppButton variant="ghost" onClick={loadBookings} disabled={loading}>
            Refresh
          </AppButton>
        </div>

        {error && bookings.length > 0 ? (
          <ErrorState
            className="mt-6"
            title="We could not finish that booking step"
            description={error}
            actionLabel="Refresh bookings"
            onAction={loadBookings}
          />
        ) : null}

        <div className="mt-8 rounded-[28px] border border-stone-200 bg-stone-50 p-5">
          <p className="font-semibold text-stone-900">Payment guide</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>Unpaid: no payment has been created for this booking yet.</li>
            <li>Waiting for transfer: your bank transfer details are ready and waiting for your confirmation.</li>
            <li>In progress: your payment is still being completed or reviewed.</li>
            <li>Paid: your payment has been confirmed and the booking is ready to go ahead.</li>
            <li>Not completed: this payment did not go through, so you can try again.</li>
            <li>Refunded: the booking was cancelled and the payment was recorded as refunded.</li>
          </ul>
        </div>

        {loading ? (
          <BookingListSkeleton />
        ) : error && bookings.length === 0 ? (
          <div className="mt-10">
            <ErrorState
              title="We could not load your bookings"
              description={error}
              actionLabel="Try again"
              onAction={loadBookings}
            />
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={CalendarRange}
              title="No bookings yet"
              description="Your appointments will appear here after you complete a booking."
              action={
                <Link
                  to="/services"
                  className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Browse services
                </Link>
              }
            />
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
              const isRefunded = booking.paymentStatus === "REFUNDED";
              const isRejected = booking.paymentStatus === "REJECTED";
              const isCancelled = booking.status === "CANCELLED";
              const isMomoPending = isPending && latestPayment?.method === "MOMO";
              const isBankPending =
                isAwaitingTransfer ||
                (isPending && latestPayment?.method === "BANK_TRANSFER");
              const latestPaymentHostedUrl =
                latestPayment?.payUrl ||
                latestPayment?.qrCodeUrl ||
                latestPayment?.deepLink ||
                "";

              const appointmentDate = booking.appointmentDate
                ? new Date(booking.appointmentDate)
                : null;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isExpiredDate =
                appointmentDate &&
                appointmentDate < today;

              const canCreateNewPayment =
                !isExpiredDate &&
                !isPaid &&
                !isRefunded &&
                !isAwaitingTransfer &&
                (!isPending || latestPayment?.method === "MOMO");
              const canSelectPaymentMethod =
                !isExpiredDate &&
                !isPaid &&
                !isRefunded &&
                !isAwaitingTransfer &&
                (!isPending || latestPayment?.method === "MOMO");
              const showPaymentActions =
                !isRefunded && (canPay || isRejected || isCancelled || isMomoPending);
              const disablePrimaryPaymentAction =
                creatingBookingId === booking.id || !canCreateNewPayment;

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
                          Payment:
                        </span>
                        <StatusBadge value={booking.paymentStatus} />
                        <span className="text-sm text-stone-500">
                          Booking:
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
                        Current progress: {workflowLabel}
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

                      {showPaymentActions ? (
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
                                  } ${!canSelectPaymentMethod ? "opacity-50" : ""}`}
                                  disabled={!canSelectPaymentMethod}
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
                            onClick={() => {
                              if (
                                selectedMethod === "MOMO" &&
                                isMomoPending &&
                                latestPaymentHostedUrl
                              ) {
                                window.location.href = latestPaymentHostedUrl;
                                return;
                              }

                              handleCreatePayment(booking);
                            }}
                            disabled={disablePrimaryPaymentAction}
                          >
                            {creatingBookingId === booking.id
                              ? selectedMethod === "MOMO"
                                ? "Preparing MoMo payment..."
                                : "Preparing bank transfer..."
                              : selectedMethod === "MOMO"
                                ? isMomoPending
                                  ? "Continue to payment with MoMo"
                                  : "Pay with MoMo"
                                : isMomoPending
                                  ? "Use bank transfer instead"
                                  : "Show bank transfer details"}
                          </AppButton>

                          {!canCreateNewPayment ? (
                            <p className="text-xs text-stone-500">
                              {isExpiredDate
                                ? "This appointment date has already passed."
                                : isPaid
                                  ? "Payment is already complete."
                                  : isAwaitingTransfer
                                    ? "Your bank transfer details are already shown above."
                                    : "This booking already has a payment in progress."}
                            </p>
                          ) : selectedMethod === "MOMO" ? (
                            <p className="text-xs text-stone-500">
                              {isMomoPending
                                ? "If you left MoMo before finishing, continue here to reopen the payment page."
                                : "You will be redirected to MoMo to finish your payment."}
                            </p>
                          ) : (
                            <p className="text-xs text-stone-500">
                              {isMomoPending
                                ? "Prefer bank transfer instead? Continue here and we will show the account details right away."
                                : "We will show the bank transfer details after you continue."}
                            </p>
                          )}
                        </div>
                      ) : isBankPending ? (
                        <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                          {isAwaitingTransfer
                            ? "Use the bank transfer details above, then confirm the transfer."
                            : "We received your transfer confirmation and will review it shortly."}
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
