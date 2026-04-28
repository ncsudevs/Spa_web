import { useEffect, useState } from "react";
import { Search, UserCircle2 } from "lucide-react";
import {
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../../api/customerApi";
import AppButton from "../../components/app/AppButton";
import PageHeader from "../../components/shared/PageHeader";
import SectionCard from "../../components/shared/SectionCard";
import StatusBadge from "../../components/shared/StatusBadge";
import {
  getBookingStatusBadgeLabels,
  getBookingWorkflowLabel,
  getBookingWorkflowStatus,
} from "../../utils/bookingStatus";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    region: "VN",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setEditForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        region: "VN",
        isActive: data.isActive ?? true,
      });
    } catch (err) {
      setDetailError(err.message || "Cannot load customer detail.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDeleteCustomer(customer) {
    if (!customer?.canDelete) return;

    if (
      !window.confirm(
        `Delete customer ${customer.fullName} (${customer.email})? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setDetailError("");
      await deleteCustomer(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      if (selected?.id === customer.id) {
        setSelected(null);
      }
    } catch (err) {
      setDetailError(err.message || "Delete failed.");
    } finally {
      setDeleting(false);
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
              <table className="w-full min-w-[900px]">
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
                      className={
                        idx !== filtered.length - 1
                          ? "border-b border-stone-100"
                          : ""
                      }
                    >
                      <td className="p-3 font-medium text-stone-900">
                        {c.fullName}
                      </td>
                      <td className="p-3 text-stone-600">{c.email}</td>
                      <td className="p-3 text-stone-600">{c.phone || "-"}</td>
                      <td className="p-3 text-stone-600">{c.bookingCount}</td>
                      <td className="p-3 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            c.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {c.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <AppButton
                            variant="ghost"
                            className="px-3 py-2"
                            onClick={() => loadDetail(c.id)}
                          >
                            View
                          </AppButton>
                          <AppButton
                            variant="danger"
                            className="px-3 py-2"
                            onClick={() => handleDeleteCustomer(c)}
                            disabled={!c.canDelete || deleting}
                            title={c.deleteBlockedReason || "Delete customer"}
                          >
                            Delete
                          </AppButton>
                        </div>
                        {!c.canDelete ? (
                          <p className="mt-2 text-xs text-amber-700">
                            {c.deleteBlockedReason}
                          </p>
                        ) : null}
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
              <div className="space-y-2">
                <p className="text-lg font-semibold text-stone-900">
                  Edit customer
                </p>
                <p className="text-sm text-stone-600">{selected.email}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-stone-600">
                    Full name
                    <input
                      className="field mt-1"
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fullName: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm text-stone-600">
                    Phone
                    <input
                      className="field mt-1"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      placeholder="+8490xxxxxxx"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isActive: e.target.checked })
                      }
                    />
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <AppButton
                    variant="blue"
                    onClick={async () => {
                      try {
                        setSaving(true);
                        await updateCustomer(selected.id, editForm);
                        await load();
                        await loadDetail(selected.id);
                      } catch (err) {
                        setDetailError(err.message || "Update failed.");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </AppButton>
                  <AppButton
                    variant="danger"
                    className="text-red-600 hover:bg-red-50"
                    disabled={deleting || !selected.canDelete}
                    title={selected.deleteBlockedReason || "Delete customer"}
                    onClick={() => handleDeleteCustomer(selected)}
                  >
                    {deleting ? "Deleting..." : "Delete customer"}
                  </AppButton>
                  <p className="text-xs text-stone-500">
                    Created: {formatDateTime(selected.createdAt)}
                  </p>
                </div>
                {!selected.canDelete ? (
                  <p className="text-xs text-amber-700">
                    {selected.deleteBlockedReason}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-semibold text-stone-800">Bookings</p>
                {selected.bookings.length === 0 ? (
                  <p className="mt-2 text-sm text-stone-500">No bookings.</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {selected.bookings.map((b) => (
                      <div key={b.id} className="rounded-2xl border border-stone-200 p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                          <StatusBadge
                            value={getBookingWorkflowStatus(b)}
                            labels={getBookingStatusBadgeLabels(b)}
                          />
                          <StatusBadge value={b.paymentStatus} />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-stone-900">
                            {b.bookingCode}
                          </span>
                          <span className="text-xs text-stone-500">
                            ({getBookingWorkflowLabel(b)} / {b.paymentStatus})
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {formatDateTime(b.createdAt)}
                        </p>
                        <p className="text-sm text-stone-700">
                          {formatCurrency(b.totalAmount)}
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-stone-500">
                          {(b.items || []).map((it, idx) => (
                            <div key={idx}>
                              {`${it.serviceName} - ${formatDateTime(it.appointmentDate)} ${it.appointmentTime}`}
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
                  <p className="mt-2 text-sm text-stone-500">No payments.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selected.payments.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-stone-200 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900">
                            {p.paymentCode}
                          </span>
                          <span className="text-xs text-stone-500">
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {formatDateTime(p.paidAt)}
                        </p>
                        <p className="text-sm text-rose-600">
                          {formatCurrency(p.amount)}
                        </p>
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
