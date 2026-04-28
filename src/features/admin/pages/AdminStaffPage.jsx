import { useMemo, useState } from "react";
import { Edit, Plus, Trash2, UserRound } from "lucide-react";
import {
  createStaff,
  deleteStaff,
  updateStaff,
  bulkUpdateStaffStatus,
} from "../../staff/api/staffApi";
import AppButton from "../../../shared/components/AppButton";
import EmptyState from "../../../shared/components/EmptyState";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";
import TableScrollFrame from "../../../shared/components/TableScrollFrame";
import { useStaff } from "../../staff/hooks/useStaff";
import { useServiceCategories } from "../../services/hooks/useServiceCategories";

export default function StaffPage() {
  const { staff: items, loading, error: loadError, reload } = useStaff();
  const { categories } = useServiceCategories();
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    categoryIds: [],
    isActive: true,
    maxConcurrent: 1,
  });

  const displayError = error || loadError;

  const summary = useMemo(
    () => ({
      total: items.length,
      active: items.filter((x) => x.isActive).length,
      inactive: items.filter((x) => !x.isActive).length,
    }),
    [items],
  );

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      categoryIds: [],
      isActive: true,
      maxConcurrent: 1,
    });
    setError("");
    setOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      fullName: item.fullName || "",
      email: item.email || "",
      phone: item.phone || "",
      categoryIds: item.categoryIds || [],
      isActive: !!item.isActive,
      maxConcurrent: item.maxConcurrent ?? 1,
    });
    setError("");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      if (!form.fullName.trim()) return setError("Full name is required.");

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        categoryIds: form.categoryIds,
        isActive: !!form.isActive,
        maxConcurrent: Math.max(1, Number(form.maxConcurrent) || 1),
      };

      if (editingId) await updateStaff(editingId, payload);
      else await createStaff(payload);

      closeModal();
      await reload();
    } catch (err) {
      setError(err.message || "Save failed.");
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete staff "${item.fullName}"?`)) return;
    try {
      setError("");
      await deleteStaff(item.id);
      await reload();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        eyebrow="Admin"
        title="Staff / Therapists"
        description="Manage therapists, contact details, and the service categories each person can handle."
        actions={
          <AppButton onClick={openCreate}>
            <Plus size={18} /> Add staff
          </AppButton>
        }
      />

      {displayError ? (
        <p className="mb-4 text-sm text-red-600">{displayError}</p>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SectionCard title="Total staff" className="p-5">
          <p className="text-3xl font-semibold text-stone-900">
            {summary.total}
          </p>
        </SectionCard>
        <SectionCard title="Active" className="p-5">
          <p className="text-3xl font-semibold text-emerald-700">
            {summary.active}
          </p>
        </SectionCard>
        <SectionCard title="Inactive" className="p-5">
          <p className="text-3xl font-semibold text-stone-700">
            {summary.inactive}
          </p>
        </SectionCard>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AppButton onClick={openCreate}>
          <Plus size={16} /> Add staff
        </AppButton>
        <AppButton
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={async () => {
            await bulkUpdateStaffStatus(selectedIds, "INACTIVE");
            setSelectedIds([]);
            reload();
          }}
        >
          Inactivate selected
        </AppButton>
        <AppButton
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={async () => {
            await bulkUpdateStaffStatus(selectedIds, "ACTIVE");
            setSelectedIds([]);
            reload();
          }}
        >
          Activate selected
        </AppButton>
      </div>

      <SectionCard
        title="Staff list"
        description="Keep staff details current so assignment and scheduling stay accurate."
      >
        {loading ? (
          <div className="py-8 text-sm text-stone-500">Loading staff...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="No staff yet"
            description="Add therapists/technicians to enable automatic assignment."
            action={
              <AppButton onClick={openCreate}>
                <Plus size={16} /> Add staff
              </AppButton>
            }
          />
        ) : (
          <TableScrollFrame scrollAreaClassName="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-stone-200 text-left text-sm text-stone-500">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === items.length
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked ? items.map((i) => i.id) : [],
                        )
                      }
                    />
                  </th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Categories</th>
                  <th className="p-4">Max concurrent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={
                      index !== items.length - 1 ? "border-b border-stone-100" : ""
                    }
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) =>
                          setSelectedIds((prev) =>
                            e.target.checked
                              ? [...prev, item.id]
                              : prev.filter((x) => x !== item.id),
                          )
                        }
                      />
                    </td>
                    <td className="p-4 font-medium text-stone-900">
                      {item.fullName}
                    </td>
                    <td className="p-4 text-stone-600">
                      <div className="text-sm text-stone-800">
                        {item.email || "-"}
                      </div>
                      <div className="text-xs text-stone-500">
                        {item.phone || "-"}
                      </div>
                    </td>
                    <td className="p-4 text-stone-600">
                      {item.categoryNames && item.categoryNames.length > 0
                        ? item.categoryNames.join(", ")
                        : "-"}
                    </td>
                    <td className="p-4 text-stone-600">
                      {item.maxConcurrent ?? 1}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <AppButton
                          variant="ghost"
                          className="px-3 py-2"
                          onClick={() => openEdit(item)}
                        >
                          <Edit size={16} />
                        </AppButton>
                        <AppButton
                          variant="ghost"
                          className="px-3 py-2 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={16} />
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScrollFrame>
        )}
      </SectionCard>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            <div className="border-b border-stone-200 px-5 py-4 sm:px-8 sm:py-6">
              <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">
                {editingId ? "Edit staff" : "Add staff"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Active staff can be assigned to upcoming bookings.
              </p>
            </div>

            <div className="overflow-y-auto px-5 py-4 sm:px-8 sm:py-6">
              <label className="block text-sm text-stone-700">
                <span className="mb-2 block font-medium">Full name</span>
                <input
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-stone-700">
                  <span className="mb-2 block font-medium">Email</span>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </label>
                <label className="text-sm text-stone-700">
                  <span className="mb-2 block font-medium">Phone</span>
                  <input
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm text-stone-700">
                <span className="mb-2 block font-medium">Service categories</span>
                <div className="rounded-xl border border-stone-200 p-3">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const selected = form.categoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            updateField(
                              "categoryIds",
                              selected
                                ? form.categoryIds.filter((id) => id !== c.id)
                                : [...form.categoryIds, c.id],
                            );
                          }}
                          className={`rounded-full px-3 py-1 text-sm ${
                            selected
                              ? "border border-rose-200 bg-rose-100 text-rose-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                  {categories.length === 0 ? (
                    <p className="mt-2 text-xs text-stone-500">
                      No categories yet. Create categories first.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-stone-500">
                      Choose the service groups this person can cover.
                    </p>
                  )}
                </div>
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-stone-700">
                  <span className="mb-2 block font-medium">Max concurrent</span>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                    value={form.maxConcurrent}
                    onChange={(e) =>
                      updateField("maxConcurrent", e.target.value)
                    }
                  />
                </label>
                <label className="text-sm text-stone-700">
                  <span className="mb-2 block font-medium">Status</span>
                  <select
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                    value={form.isActive ? "ACTIVE" : "INACTIVE"}
                    onChange={(e) =>
                      updateField("isActive", e.target.value === "ACTIVE")
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </label>
              </div>

              {error ? (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-stone-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
              <AppButton type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </AppButton>
              <AppButton type="submit">
                {editingId ? "Save changes" : "Add staff"}
              </AppButton>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
