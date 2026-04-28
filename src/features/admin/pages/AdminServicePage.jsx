import { useMemo, useState } from "react";
import { Edit, EyeOff, Plus, Scissors, Trash2 } from "lucide-react";
import {
  createService,
  deleteService,
  updateService,
} from "../../services/api/serviceApi";
import AppButton from "../../../shared/components/AppButton";
import EmptyState from "../../../shared/components/EmptyState";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";
import StatusBadge from "../../../shared/components/StatusBadge";
import {
  SERVICE_STATUS_LABELS,
  SERVICE_STATUS_OPTIONS,
} from "../../services/constants/serviceStatus";
import { useServiceCategories } from "../../services/hooks/useServiceCategories";
import { useServices } from "../../services/hooks/useServices";
import { getServiceImageUrl } from "../../services/utils/serviceMappers";
import { formatCurrency } from "../../../shared/utils/formatters";

export default function ServicePage() {
  const { categories, reload: reloadCategories } = useServiceCategories();
  const {
    services: items,
    loading,
    error: loadError,
    reload: reloadServices,
  } = useServices();
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    duration: "",
    slotCapacity: "5",
    status: "ACTIVE",
    categoryId: "",
    imageFile: null,
    imagePreview: "",
  });

  const displayError = error || loadError;

  const categoriesReady = categories.length > 0;

  // Summary cards help admins understand how many services are visible versus hidden.
  const summary = useMemo(
    () => ({
      total: items.length,
      visible: items.filter(
        (item) => (item.status || "ACTIVE").toUpperCase() === "ACTIVE",
      ).length,
      hidden: items.filter(
        (item) => (item.status || "ACTIVE").toUpperCase() === "INACTIVE",
      ).length,
    }),
    [items],
  );

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  // Reset prepares the form for create mode and optionally preselects the first available category.
  function resetForm(nextCategoryId = categories[0]?.id ?? "") {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      description: "",
      duration: "",
      slotCapacity: "5",
      status: "ACTIVE",
      categoryId: nextCategoryId ? String(nextCategoryId) : "",
      imageFile: null,
      imagePreview: "",
    });
  }

  // Shared reload keeps service and category sources in sync after admin operations.
  async function reloadAll() {
    await Promise.allSettled([reloadServices(), reloadCategories()]);
  }

  function openAdd() {
    setError("");
    resetForm(categories[0]?.id ?? "");
    setOpen(true);
  }

  // Edit mode copies the selected row into the form so admins can update status or content quickly.
  function openEdit(item) {
    setError("");
    setEditingId(item.id);
    setForm({
      name: item.name ?? "",
      price: item.price != null ? String(item.price) : "",
      description: item.description ?? "",
      duration: item.duration != null ? String(item.duration) : "",
      slotCapacity: item.slotCapacity != null ? String(item.slotCapacity) : "5",
      status: item.status ?? "ACTIVE",
      categoryId: item.categoryId != null ? String(item.categoryId) : "",
      imageFile: null,
      imagePreview: getServiceImageUrl(item.imageUrl),
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setError("");
    resetForm(categories[0]?.id ?? "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");

      if (!form.name.trim()) return setError("Name is required.");
      if (!form.categoryId) return setError("Please choose a category.");

      // Form values are normalized before sending to the API because input values arrive as strings.
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price === "" ? null : Number(form.price),
        duration: form.duration === "" ? null : Number(form.duration),
        slotCapacity: form.slotCapacity === "" ? 5 : Number(form.slotCapacity),
        status: form.status || "ACTIVE",
        categoryId: Number(form.categoryId),
        imageFile: form.imageFile,
      };

      if (payload.price == null || Number.isNaN(payload.price))
        return setError("Price must be a number.");
      if (payload.duration == null || Number.isNaN(payload.duration))
        return setError("Duration must be a number.");
      if (
        payload.slotCapacity == null ||
        Number.isNaN(payload.slotCapacity) ||
        payload.slotCapacity < 1
      ) {
        return setError("Slot capacity must be at least 1.");
      }

      if (editingId) await updateService(editingId, payload);
      else await createService(payload);

      closeModal();
      await reloadAll();
    } catch (err) {
      setError(err.message || "Save failed.");
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete service "${item.name}"?`)) return;
    try {
      setError("");
      await deleteService(item.id);
      await reloadServices();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        eyebrow="Admin"
        title="Service management"
        description="Use status to control customer visibility. ACTIVE means show on the customer site, INACTIVE means hide it without deleting the service."
        actions={
          <AppButton onClick={openAdd} disabled={!categoriesReady}>
            <Plus size={18} /> Add service
          </AppButton>
        }
      />

      {displayError ? (
        <p className="mb-4 text-sm text-red-600">{displayError}</p>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SectionCard title="Total services" className="p-5">
          <p className="text-3xl font-semibold text-stone-900">
            {summary.total}
          </p>
        </SectionCard>
        <SectionCard title="Showing to customers" className="p-5">
          <p className="text-3xl font-semibold text-green-700">
            {summary.visible}
          </p>
        </SectionCard>
        <SectionCard title="Hidden from customers" className="p-5">
          <p className="text-3xl font-semibold text-stone-700">
            {summary.hidden}
          </p>
        </SectionCard>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AppButton onClick={openAdd} disabled={!categoriesReady}>
          <Plus size={16} /> Add service
        </AppButton>
        <AppButton
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={async () => {
            await bulkUpdateServiceStatus(selectedIds, "INACTIVE");
            setSelectedIds([]);
            reloadServices();
          }}
        >
          <EyeOff size={16} /> Inactivate selected
        </AppButton>
        <AppButton
          variant="secondary"
          disabled={selectedIds.length === 0}
          onClick={async () => {
            await bulkUpdateServiceStatus(selectedIds, "ACTIVE");
            setSelectedIds([]);
            reloadServices();
          }}
        >
          Activate selected
        </AppButton>
      </div>

      <SectionCard
        title="Service list"
        description="This layout follows the cleaner shared-component structure from your idea system."
      >
        {loading ? (
          <div className="py-8 text-sm text-stone-500">Loading services...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No services yet"
            description="Create your first service to make it available for booking."
            action={
              <AppButton onClick={openAdd} disabled={!categoriesReady}>
                <Plus size={16} /> Add service
              </AppButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
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
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Slots</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={
                      index !== items.length - 1
                        ? "border-b border-stone-100"
                        : ""
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
                    <td className="p-4">
                      <img
                        src={getServiceImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="h-16 w-20 rounded-xl object-cover"
                      />
                    </td>
                    <td className="p-4 font-medium text-stone-900">
                      {item.name}
                    </td>
                    <td className="p-4 text-stone-600">
                      {item.categoryName || "-"}
                    </td>
                    <td className="p-4 text-stone-600">
                      {item.duration ?? "-"}
                    </td>
                    <td className="p-4 text-rose-600">
                      {item.price != null ? formatCurrency(item.price) : "-"}
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        value={item.status}
                        labels={SERVICE_STATUS_LABELS}
                      />
                    </td>
                    <td className="p-4 text-stone-600">
                      {item.slotCapacity ?? 5}
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
          </div>
        )}
      </SectionCard>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-stone-900">
                  {editingId ? "Edit service" : "Add service"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  ACTIVE = show to customer, INACTIVE = hide from customer
                  pages.
                </p>
              </div>
              <StatusBadge value={form.status} labels={SERVICE_STATUS_LABELS} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-stone-700">
                <span className="mb-2 block font-medium">Service name</span>
                <input
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </label>
              <label className="text-sm text-stone-700">
                <span className="mb-2 block font-medium">Category</span>
                <select
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-stone-700">
                <span className="mb-2 block font-medium">Price</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </label>
              <label className="text-sm text-stone-700">
                <span className="mb-2 block font-medium">
                  Duration (minutes)
                </span>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                />
              </label>
              <label className="text-sm text-stone-700">
                <span className="mb-2 block font-medium">Slots per time</span>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.slotCapacity}
                  onChange={(e) => updateField("slotCapacity", e.target.value)}
                />
              </label>
              <label className="text-sm text-stone-700">
                <span className="mb-2 block font-medium">
                  Visibility status
                </span>
                {/* ACTIVE shows the service on customer pages, INACTIVE keeps the record but hides it from customers. */}
                <select
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  {SERVICE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-2 text-sm text-stone-700">
                <span className="mb-2 block font-medium">Description</span>
                <textarea
                  rows="4"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </label>
              <label className="md:col-span-2 text-sm text-stone-700">
                <span className="mb-2 block font-medium">Service image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3"
                  onChange={(e) =>
                    updateField("imageFile", e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            {form.imagePreview ? (
              <div className="mt-5 rounded-2xl border border-stone-200 p-3">
                <p className="mb-3 text-sm font-medium text-stone-700">
                  Current image
                </p>
                <img
                  src={form.imagePreview}
                  alt="Service preview"
                  className="h-40 w-full rounded-2xl object-cover"
                />
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <AppButton type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </AppButton>
              <AppButton type="submit">
                {form.status === "INACTIVE" ? <EyeOff size={16} /> : null}
                {editingId ? "Save changes" : "Create service"}
              </AppButton>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
