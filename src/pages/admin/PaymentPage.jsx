import { useEffect, useState } from "react";
import { deletePayment, getPayments, updatePaymentStatus } from "../../api/paymentApi";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const STATUS_OPTIONS = ["PENDING", "PAID", "REJECTED", "REFUNDED"];

export default function PaymentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
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
      setBusyId(`status-${id}`);
      const updated = await updatePaymentStatus(id, status);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err.message || "Cannot update payment status.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(id, code) {
    const confirmed = window.confirm(`Delete payment ${code}?`);
    if (!confirmed) return;

    try {
      setBusyId(`delete-${id}`);
      await deletePayment(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Cannot delete payment.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="p-12">
      <h1 className="mb-8 text-4xl font-semibold">Payments</h1>
      <p className="mb-6 text-sm text-stone-500">Bank transfer payments can be updated manually. MoMo payments are updated automatically after the hosted payment flow finishes and the IPN reaches the backend.</p>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="p-6 text-left">Payment code</th>
              <th className="p-6 text-left">Booking code</th>
              <th className="p-6 text-left">Method</th>
              <th className="p-6 text-left">Payment info</th>
              <th className="p-6 text-left">Status</th>
              <th className="p-6 text-left">Amount</th>
              <th className="p-6 text-left">Paid at</th>
              <th className="p-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-6">Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6">No payments yet</td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-b last:border-b-0 align-top">
                  <td className="p-6 font-medium">{x.paymentCode}</td>
                  <td className="p-6">{x.bookingCode}</td>
                  <td className="p-6">{x.method}</td>
                  <td className="p-6 text-sm text-stone-600">
                    <div>{x.providerName || '-'}</div>
                    <div>{x.accountNumber || '-'}</div>
                    <div className="font-medium text-stone-900">{x.paymentContent || '-'}</div>
                  </td>
                  <td className="p-6">
                    <select
                      value={x.status}
                      onChange={(e) => handleStatusChange(x.id, e.target.value)}
                      disabled={busyId === `status-${x.id}` || x.method === "MOMO"}
                      className="rounded-xl border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100 disabled:text-stone-400"
                      title={x.method === "MOMO" ? "MoMo payments are updated automatically by IPN." : "Update payment status"}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {x.method === "MOMO" ? (
                      <p className="mt-2 text-xs text-stone-500">Auto-updated by MoMo IPN</p>
                    ) : null}
                  </td>
                  <td className="p-6">{formatCurrency(x.amount)}</td>
                  <td className="p-6">{formatDateTime(x.paidAt)}</td>
                  <td className="p-6">
                    <button
                      type="button"
                      onClick={() => handleDelete(x.id, x.paymentCode)}
                      disabled={busyId === `delete-${x.id}`}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
