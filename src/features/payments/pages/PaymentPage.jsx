import { Landmark, Wallet } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPayment } from "../api/paymentApi";
import FormErrorAlert from "../../../shared/components/FormErrorAlert";
import useFormErrorAssist from "../../../shared/hooks/useFormErrorAssist";
import { clearCart } from "../../../shared/utils/customerStorage";
import { formatCurrency, formatDate } from "../../../shared/utils/formatters";

const methods = [
  {
    id: "MOMO",
    label: "MoMo",
    icon: Wallet,
    description: "Continue to the MoMo payment page and finish the payment there.",
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank transfer",
    icon: Landmark,
    description: "View the bank details, make the transfer, and confirm once it has been sent.",
  },
];

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState("MOMO");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const booking = location.state?.booking;
  const { errorRef } = useFormErrorAssist(error);

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            Payment
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900">
            Payment details not available
          </h1>
          <p className="mt-4 text-stone-600">
            Open My Bookings to continue payment for one of your existing
            bookings.
          </p>
          <button
            type="button"
            onClick={() => navigate("/my-bookings")}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Go to My Bookings
          </button>
        </section>
      </div>
    );
  }

  async function handlePay() {
    try {
      setSubmitting(true);
      setError("");

      const payment = await createPayment({
        bookingId: booking.id,
        method,
      });

      clearCart();

      if (method === "MOMO") {
        const hostedUrl = payment.payUrl || payment.qrCodeUrl || payment.deepLink;

        if (hostedUrl) {
          window.location.href = hostedUrl;
          return;
        }

        throw new Error("We could not open MoMo right now. Please try again.");
      }

      navigate("/my-bookings", {
        state: {
          paymentSuccess: true,
          bookingCode: booking.bookingCode,
          paymentCode: payment.paymentCode,
          email: booking.email,
        },
      });
    } catch (err) {
      setError(err.message || "Cannot create payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            Payment
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">
            Choose your payment method
          </h1>

          <FormErrorAlert message={error} errorRef={errorRef} className="mt-6" />

          <div className="mt-8 grid gap-4">
            {methods.map((item) => {
              const Icon = item.icon;
              const selected = method === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`flex items-center gap-4 rounded-[28px] border p-5 text-left transition ${
                    selected
                      ? "border-rose-300 bg-rose-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-stone-900">
                      {item.label}
                    </span>
                    <span className="text-sm text-stone-500">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={submitting}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? method === "MOMO"
                ? "Preparing MoMo payment..."
                : "Preparing bank transfer..."
              : method === "MOMO"
                ? "Pay with MoMo"
                : "Show bank transfer details"}
          </button>
        </section>

        <aside className="h-fit rounded-[32px] bg-stone-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Order summary</h2>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-stone-300">
            <p>
              <span className="text-stone-500">Booking code:</span>{" "}
              {booking.bookingCode}
            </p>
            <p className="mt-2">
              <span className="text-stone-500">Customer:</span>{" "}
              {booking.fullName}
            </p>
          </div>
          <div className="mt-6 space-y-4 text-sm text-stone-300">
            {(booking.items || []).map((item, index) => (
              <div
                key={`${item.serviceId}-${index}`}
                className="rounded-3xl bg-white/5 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.serviceName}</p>
                    <p className="text-xs text-stone-400">
                      {formatDate(item.appointmentDate)} - {item.appointmentTime}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-xl font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
