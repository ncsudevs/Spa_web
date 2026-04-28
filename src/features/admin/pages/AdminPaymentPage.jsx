import { useEffect, useState } from "react";
import { deletePayment, getPayments, updatePaymentStatus } from "../../payments/api/paymentApi";
import AppButton from "../../../shared/components/AppButton";
import StatusBadge from "../../../shared/components/StatusBadge";
import { useAuth } from "../../../context/useAuth";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";

const STATUS_OPTIONS = [
  "AWAITING_TRANSFER",
  "PENDING",
  "PAID",
  "REJECTED",
  "REFUNDED",
];

export default function PaymentPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

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

      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px]">
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
                        <p className="text-xs text-stone-500">
                          {isMomo
                            ? "MoMo is updated automatically by IPN."
                            : isAwaitingTransfer
                              ? "Waiting for the customer to press Confirm transfer."
                              : "Cashier can mark this transfer as PAID or REJECTED after review."}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 font-medium text-stone-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-5 text-sm text-stone-500">
                      {formatDateTime(item.paidAt)}
                    </td>
                    <td className="p-5">
                      {canDelete ? (
                        <AppButton
                          variant="danger"
                          onClick={() => handleDelete(item.id, item.paymentCode)}
                          disabled={busyKey === `delete-${item.id}`}
                        >
                          Delete
                        </AppButton>
                      ) : (
                        <span className="text-xs text-stone-400">Cashier view</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
