import { useEffect, useState } from "react";
import { getPayments } from "../../api/paymentApi";

export default function PaymentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    loadData();
  }, []);

  return (
    <div className="p-12">
      <h1 className="mb-8 text-4xl font-semibold">Payments</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="p-6 text-left">Payment code</th>
              <th className="p-6 text-left">Booking code</th>
              <th className="p-6 text-left">Method</th>
              <th className="p-6 text-left">Status</th>
              <th className="p-6 text-left">Amount</th>
              <th className="p-6 text-left">Paid at</th>
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
                  No payments yet
                </td>
              </tr>
            ) : (
              items.map((x) => (
                <tr key={x.id} className="border-b last:border-b-0">
                  <td className="p-6 font-medium">{x.paymentCode}</td>
                  <td className="p-6">{x.bookingCode}</td>
                  <td className="p-6">{x.method}</td>
                  <td className="p-6">{x.status}</td>
                  <td className="p-6">${x.amount}</td>
                  <td className="p-6">
                    {x.paidAt ? new Date(x.paidAt).toLocaleString() : "-"}
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
