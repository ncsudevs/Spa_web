import { useEffect, useState } from "react";
import {
  deleteBooking,
  getBookings,
  updateBookingStatus,
} from "../../api/bookingApi";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function BookingPage() {
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
      setError("");
      const data = await getBookings();
      setItems(data || []);
    } catch (err) {
      setError(err.message || "Cannot load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setBusyId(`status-${id}`);
      const updated = await updateBookingStatus(id, status);
      setItems((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      setError(err.message || "Cannot update booking status.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(id, code) {
    const confirmed = window.confirm(`Delete booking ${code}?`);
    if (!confirmed) return;

    try {
      setBusyId(`delete-${id}`);
      await deleteBooking(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Cannot delete booking.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="p-12">
      <h1 className="mb-8 text-4xl font-semibold">Bookings</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="p-6 text-left">Code</th>
              <th className="p-6 text-left">Customer</th>
              <th className="p-6 text-left">Appointment</th>
              <th className="p-6 text-left">Booking status</th>
              <th className="p-6 text-left">Payment</th>
              <th className="p-6 text-left">Total</th>
              <th className="p-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6">
                  No bookings yet
                </td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-b last:border-b-0 align-top">
                  <td className="p-6 font-medium">{x.bookingCode}</td>
                  <td className="p-6">
                    {x.fullName}
                    <div className="text-sm text-stone-500">{x.email}</div>
                    <div className="text-sm text-stone-500">{x.phone}</div>
                    <div className="mt-2 text-xs text-stone-400">
                      Created at {formatDateTime(x.createdAt)}
                    </div>
                    {x.isGroupBooking ? (
                      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-violet-600">
                        Group booking • {x.groupSize} people
                      </div>
                    ) : null}
                  </td>
                  <td className="p-6">
                    <div className="space-y-2 text-sm">
                      {(x.items || []).map((item, index) => (
                        <div key={`${x.id}-${item.serviceId}-${index}`}>
                          <div className="font-medium text-stone-900">
                            {item.serviceName}
                          </div>
                          <div className="text-stone-500">
                            {formatDate(item.appointmentDate)} • {item.appointmentTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-6">
                    <select
                      value={x.status}
                      onChange={(e) => handleStatusChange(x.id, e.target.value)}
                      disabled={busyId === `status-${x.id}`}
                      className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-6">{x.paymentStatus}</td>
                  <td className="p-6">{formatCurrency(x.totalAmount)}</td>
                  <td className="p-6">
                    <button
                      type="button"
                      onClick={() => handleDelete(x.id, x.bookingCode)}
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
