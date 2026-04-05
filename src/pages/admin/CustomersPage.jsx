import { useEffect, useState } from "react";
import { UserCircle2, Search } from "lucide-react";
import { getCustomers, getCustomerById } from "../../api/customerApi";
import AppButton from "../../components/app/AppButton";
import PageHeader from "../../components/shared/PageHeader";
import SectionCard from "../../components/shared/SectionCard";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (err) {
      setError(err.message || "Cannot load customers.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id) {
    try {
      setDetailLoading(true);
      setDetailError("");
      const data = await getCustomerById(id);
      setSelected(data);
    } catch (err) {
      setDetailError(err.message || "Cannot load customer detail.");
    } finally {
      setDetailLoading(false);
    }
  }

  const filtered = customers.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        eyebrow="Admin"
        title="Customers"
        description="View customers and their bookings/payments."
      />

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-stone-400" />
          <input
            className="w-64 bg-transparent text-sm outline-none"
            placeholder="Search by name, email, phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <AppButton variant="ghost" onClick={load} disabled={loading}>
          Refresh
        </AppButton>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        <SectionCard title="Customer list">
          {loading ? (
            <div className="py-8 text-sm text-stone-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-sm text-stone-500">No customers.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="border-b border-stone-200 text-left text-sm text-stone-500">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Bookings</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={idx !== filtered.length - 1 ? "border-b border-stone-100" : ""}
                    >
                      <td className="p-3 font-medium text-stone-900">{c.fullName}</td>
                      <td className="p-3 text-stone-600">{c.email}</td>
                      <td className="p-3 text-stone-600">{c.phone || "-"}</td>
                      <td className="p-3 text-stone-600">{c.bookingCount}</td>
                      <td className="p-3 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {c.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="p-3">
                        <AppButton
                          variant="ghost"
                          className="px-3 py-2"
                          onClick={() => loadDetail(c.id)}
                        >
                          View
                        </AppButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Customer detail">
          {detailLoading ? (
            <div className="py-6 text-sm text-stone-500">Loading detail...</div>
          ) : detailError ? (
            <p className="text-sm text-red-600">{detailError}</p>
          ) : !selected ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-stone-500">
              <UserCircle2 className="h-10 w-10" />
              <p className="text-sm">Select a customer to view detail.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-stone-900">{selected.fullName}</p>
                <p className="text-sm text-stone-600">{selected.email}</p>
                <p className="text-sm text-stone-600">{selected.phone || "-"}</p>
                <p className="mt-1 text-xs text-stone-500">
                  Created: {formatDateTime(selected.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-800">Bookings</p>
                {selected.bookings.length === 0 ? (
                  <p className="text-sm text-stone-500 mt-2">No bookings.</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {selected.bookings.map((b) => (
                      <div key={b.id} className="rounded-2xl border border-stone-200 p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-stone-900">{b.bookingCode}</span>
                          <span className="text-xs text-stone-500">({b.status} / {b.paymentStatus})</span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {formatDateTime(b.createdAt)}
                        </p>
                        <p className="text-sm text-stone-700">
                          {formatCurrency(b.totalAmount)}
                        </p>
                        <div className="mt-2 text-xs text-stone-500 space-y-1">
                          {(b.items || []).map((it, idx) => (
                            <div key={idx}>
                              {it.serviceName} • {formatDateTime(it.appointmentDate)} {it.appointmentTime}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-800">Payments</p>
                {selected.payments.length === 0 ? (
                  <p className="text-sm text-stone-500 mt-2">No payments.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selected.payments.map((p) => (
                      <div key={p.id} className="rounded-xl border border-stone-200 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900">{p.paymentCode}</span>
                          <span className="text-xs text-stone-500">{p.status}</span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {formatDateTime(p.paidAt)}
                        </p>
                        <p className="text-sm text-rose-600">{formatCurrency(p.amount)}</p>
                        <p className="text-xs text-stone-500">
                          Booking: {p.bookingCode || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
