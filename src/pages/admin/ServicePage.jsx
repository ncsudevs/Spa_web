import { useEffect, useState } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../api/serviceApi";
import { getCategories } from "../../api/serviceCategoryApi";
import { Edit, Trash2, Plus } from "lucide-react";

function getPreviewUrl(imageUrl) {
  if (!imageUrl) return "/placeholder-service.svg";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    return imageUrl;
  return `${import.meta.env.VITE_BASE_API}${imageUrl}`;
}

export default function ServicePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  async function loadData() {
    try {
      setErr("");
      setLoading(true);
      const [sv, cats] = await Promise.all([getServices(), getCategories()]);
      setItems(sv || []);
      setCategories(cats || []);
      if (!categoryId && (cats || []).length > 0) {
        setCategoryId(String(cats[0].id));
      }
    } catch (e) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setDuration("");
    setStatus("ACTIVE");
    setImageFile(null);
    setImagePreview("");
    if (categories.length > 0) setCategoryId(String(categories[0].id));
    else setCategoryId("");
  }

  function openAdd() {
    resetForm();
    setOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setName(item.name ?? "");
    setPrice(item.price != null ? String(item.price) : "");
    setDescription(item.description ?? "");
    setDuration(item.duration != null ? String(item.duration) : "");
    setStatus(item.status ?? "ACTIVE");
    setCategoryId(item.categoryId != null ? String(item.categoryId) : "");
    setImageFile(null);
    setImagePreview(getPreviewUrl(item.imageUrl));
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setErr("");

      if (!name.trim()) return setErr("Name is required");
      if (!categoryId) return setErr("Please choose a category");

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: price === "" ? null : Number(price),
        duration: duration === "" ? null : Number(duration),
        status: status || "ACTIVE",
        categoryId: Number(categoryId),
        imageFile,
      };

      if (payload.price == null || Number.isNaN(payload.price))
        return setErr("Price must be a number");
      if (payload.duration == null || Number.isNaN(payload.duration))
        return setErr("Duration must be a number");

      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }

      setOpen(false);
      resetForm();
      await loadData();
    } catch (e) {
      setErr(e.message || "Save failed");
    }
  }

  async function handleDelete(item) {
    const ok = confirm(`Delete service "${item.name}"?`);
    if (!ok) return;
    try {
      setErr("");
      await deleteService(item.id);
      await loadData();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  return (
    <div className="p-12">
      <div className="mb-12 flex items-center justify-between">
        <h1 className="text-4xl font-semibold">Services</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={18} />
          Add New Service
        </button>
      </div>

      {err && <p className="mb-4 text-red-500">{err}</p>}

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="p-6 text-left">Image</th>
              <th className="p-6 text-left">Name</th>
              <th className="p-6 text-left">Category Name</th>
              <th className="p-6 text-left">Duration</th>
              <th className="p-6 text-left">Price</th>
              <th className="p-6 text-left">Status</th>
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
                  No service yet
                </td>
              </tr>
            ) : (
              items.map((x, idx) => (
                <tr
                  key={x.id}
                  className={idx !== items.length - 1 ? "border-b" : ""}
                >
                  <td className="p-6">
                    <img
                      src={getPreviewUrl(x.imageUrl)}
                      alt={x.name}
                      className="h-16 w-20 rounded-xl object-cover"
                    />
                  </td>
                  <td className="p-6 font-medium">{x.name}</td>
                  <td className="p-6">
                    <span className="inline-block rounded-lg bg-accent px-3 py-1 text-sm">
                      {x.categoryName || "-"}
                    </span>
                  </td>
                  <td className="p-6 text-gray-600">{x.duration ?? "-"}</td>
                  <td className="p-6 text-primary">
                    {x.price != null ? x.price : "-"}
                  </td>
                  <td className="p-6">
                    <span className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">
                      {x.status ?? "ACTIVE"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(x)}
                        className="rounded-lg p-2 hover:bg-secondary"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(x)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-155 rounded-2xl bg-white p-8"
          >
            <h2 className="mb-6 text-xl font-semibold text-amber-600">
              {editingId ? "Edit Service" : "Add Service"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="rounded-lg border p-3"
                placeholder="Service name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Status (e.g. ACTIVE)"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Duration (minutes)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <input
                className="rounded-lg border p-3"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <select
                className="rounded-lg border bg-white p-3"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.length === 0 ? (
                  <option value="">No categories - create one first</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="rounded-lg border p-3"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  setImagePreview(
                    file ? URL.createObjectURL(file) : imagePreview,
                  );
                }}
              />
            </div>
            <input
              className="mt-4 w-full rounded-lg border p-3"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-stone-600">
                Image preview
              </p>
              <img
                src={imagePreview || "/placeholder-service.svg"}
                alt="preview"
                className="h-36 w-48 rounded-xl object-cover"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-black"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
