import { useEffect, useState } from "react";
import {
  deletePayment,
  getPayments,
  refundPayment,
  updatePaymentStatus,
} from "../../payments/api/paymentApi";
import AppButton from "../../../shared/components/AppButton";
import StatusBadge from "../../../shared/components/StatusBadge";
import TableScrollFrame from "../../../shared/components/TableScrollFrame";
import { useAuth } from "../../../context/useAuth";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";

const STATUS_OPTIONS = [
  "AWAITING_TRANSFER",
  "PENDING",
  "PAID",
  "REJECTED",
];

export default function PaymentPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [refundDrafts, setRefundDrafts] = useState({});
  const [openRefundId, setOpenRefundId] = useState(null);

  const canDelete = user?.role === "ADMIN";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const data = await getPayments();
      setItems(data || []);
    } catch (err) {
      setError(err.message || "Cannot load payments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setBusyKey(`status-${id}`);
      const updated = await updatePaymentStatus(id, status);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err.message || "Cannot update payment status.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleDelete(id, code) {
    if (!window.confirm(`Delete payment ${code}?`)) return;

    try {
      setBusyKey(`delete-${id}`);
      await deletePayment(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Cannot delete payment.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleRefund(item) {
    const reason = (refundDrafts[item.id] || "").trim();
    if (!reason) {
      setError("Enter a refund reason before marking the booking as refunded.");
      setOpenRefundId(item.id);
      return;
    }

    if (!window.confirm(`Cancel booking ${item.bookingCode} and mark payment ${item.paymentCode} as refunded?`)) {
      return;
    }

    try {
      setBusyKey(`refund-${item.id}`);
      setError("");
      const updated = await refundPayment(item.id, reason);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      setRefundDrafts((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setOpenRefundId(null);
    } catch (err) {
      setError(err.message || "Cannot refund payment.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-stone-900">Payments</h1>
          <p className="mt-2 text-sm text-stone-500">
            MoMo payments update from IPN. Bank transfers move from customer confirmation to cashier review, then to paid.
          </p>
        </div>
        <AppButton variant="ghost" onClick={loadData} disabled={loading}>
          Refresh
        </AppButton>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <TableScrollFrame
          scrollAreaClassName="overflow-x-auto rounded-[24px]"
        >
          <table className="w-full min-w-[1100px] overflow-hidden rounded-[24px]">
          <thead className="bg-stone-50 text-left text-sm text-stone-500">
            <tr>
              <th className="p-5">Payment</th>
              <th className="p-5">Booking</th>
              <th className="p-5">Method</th>
              <th className="p-5">Instruction</th>
              <th className="p-5">Status</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Updated</th>
              <th className="p-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-5 text-sm text-stone-500">
                  Loading payments...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-5 text-sm text-stone-500">
                  No payments yet.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isMomo = item.method === "MOMO";
                const isAwaitingTransfer = item.status === "AWAITING_TRANSFER";
                const statusLocked = isMomo || isAwaitingTransfer;
                const isRefunded = item.status === "REFUNDED";
                const refundEditorOpen = openRefundId === item.id;
                const refundBusy = busyKey === `refund-${item.id}`;

                return (
                  <tr key={item.id} className="border-t border-stone-100 align-top">
                    <td className="p-5">
                      <div className="font-semibold text-stone-900">{item.paymentCode}</div>
                      <div className="mt-1 text-xs text-stone-500">{item.transactionCode || "-"}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-stone-900">{item.bookingCode}</div>
                      <div className="mt-1 text-xs text-stone-500">Booking ID #{item.bookingId}</div>
                    </td>
                    <td className="p-5">
                      <StatusBadge value={item.method} labels={{ BANK_TRANSFER: "BANK TRANSFER" }} />
                    </td>
                    <td className="p-5 text-sm text-stone-600">
                      <div className="font-medium text-stone-900">{item.providerName || "-"}</div>
                      <div>{item.accountNumber || "-"}</div>
                      <div>{item.accountName || "-"}</div>
                      <div className="mt-2 font-medium text-stone-900">{item.paymentContent || "-"}</div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-2">
                        <StatusBadge value={item.status} />
                        {isRefunded ? (
                          <div className="w-full rounded-2xl border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-stone-500">
                            Refunded bookings are final.
                          </div>
                        ) : (
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            disabled={busyKey === `status-${item.id}` || statusLocked}
                            className="w-full rounded-2xl border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100 disabled:text-stone-400"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                        <p className="text-xs text-stone-500">
                          {isMomo
                            ? "MoMo is updated automatically by IPN."
                            : isRefunded
                              ? "This paid booking was cancelled through the refund flow."
                            : isAwaitingTransfer
                              ? "Waiting for the customer to press Confirm transfer."
                              : "Cashier can mark this transfer as PAID or REJECTED after review."}
                        </p>
                        {item.refundReason ? (
                          <div className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
                            Refund reason: {item.refundReason}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-5 font-medium text-stone-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-5 text-sm text-stone-500">
                      {formatDateTime(item.paidAt)}
                    </td>
                    <td className="p-5">
                      <div className="space-y-3">
                        {item.canRefund ? (
                          refundEditorOpen ? (
                            <div className="space-y-2">
                              <textarea
                                value={refundDrafts[item.id] || ""}
                                onChange={(e) =>
                                  setRefundDrafts((current) => ({
                                    ...current,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder="Write the refund reason for audit history"
                                className="w-full rounded-2xl border border-stone-300 px-3 py-2 text-sm"
                              />
                              <div className="flex flex-wrap gap-2">
                                <AppButton
                                  variant="danger"
                                  onClick={() => handleRefund(item)}
                                  disabled={refundBusy}
                                >
                                  {refundBusy ? "Saving refund..." : "Cancel booking and mark refunded"}
                                </AppButton>
                                <AppButton
                                  variant="ghost"
                                  onClick={() => setOpenRefundId(null)}
                                  disabled={refundBusy}
                                >
                                  Close
                                </AppButton>
                              </div>
                            </div>
                          ) : (
                            <AppButton
                              variant="danger"
                              onClick={() => setOpenRefundId(item.id)}
                              disabled={!!busyKey}
                            >
                              Refund booking
                            </AppButton>
                          )
                        ) : null}

                        {canDelete ? (
                          <AppButton
                            variant="danger"
                            onClick={() => handleDelete(item.id, item.paymentCode)}
                            disabled={busyKey === `delete-${item.id}`}
                          >
                            Delete
                          </AppButton>
                        ) : !item.canRefund ? (
                          <span className="text-xs text-stone-400">Cashier view</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </TableScrollFrame>
      </div>
    </div>
  );
}
