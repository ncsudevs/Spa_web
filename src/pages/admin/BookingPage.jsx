import { useEffect, useState } from "react";
import { getBookings } from "../../api/bookingApi";

export default function BookingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBookings();
        setItems(data || []);
      } catch (err) {
        setError(err.message || "Cannot load bookings.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
              <th className="p-6 text-left">Status</th>
              <th className="p-6 text-left">Payment</th>
              <th className="p-6 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6">
                  No bookings yet
                </td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-b last:border-b-0">
                  <td className="p-6 font-medium">{x.bookingCode}</td>
                  <td className="p-6">
                    {x.fullName}
                    <div className="text-sm text-stone-500">{x.email}</div>
                  </td>
                  <td className="p-6">
                    {x.appointmentDate}
                    <div className="text-sm text-stone-500">
                      {x.appointmentTime}
                    </div>
                  </td>
                  <td className="p-6">{x.status}</td>
                  <td className="p-6">{x.paymentStatus}</td>
                  <td className="p-6">${x.totalAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
