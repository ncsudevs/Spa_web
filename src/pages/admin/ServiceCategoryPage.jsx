import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/serviceCategoryApi";
import { Edit, Trash2, Plus } from "lucide-react";

export default function ServiceCategoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);

  // modal + form
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function loadData() {
    try {
      setErr("");
      setLoading(true);
      const data = await getCategories();
      console.log(data);
      setItems(data || []);
    } catch (e) {
      setErr(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setErr("");

      if (!name.trim()) {
        setErr("Name is required");
        return;
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (editingId) {
        // EDIT
        await updateCategory(editingId, payload);
      } else {
        // ADD
        await createCategory(payload);
      }

      setName("");
      setDescription("");
      setEditingId(null);
      setOpen(false);

      await loadData();
    } catch (e) {
      setErr(e.message || "Save failed");
    }
  }

  return (
    <div className="p-12">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-semibold">Service Categories</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>
      {err && <p style={{ color: "tomato" }}>{err}</p>}

      {/* TABLE */}
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-6">Name</th>
              <th className="text-left p-6">Description</th>
              <th className="text-left p-6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="p-6">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-6">
                  No category yet
                </td>
              </tr>
            ) : (
              items.map((x, idx) => (
                <tr
                  key={x.id}
                  className={idx !== items.length - 1 ? "border-b" : ""}
                >
                  <td className="p-6 text-black font-medium">{x.name}</td>
                  <td className="p-6 text-black ">{x.description || "-"}</td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-lg hover:bg-secondary"
                        onClick={() => {
                          setEditingId(x.id);
                          setName(x.name);
                          setDescription(x.description || "");
                          setOpen(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                        onClick={async () => {
                          if (!confirm(`Delete category "${x.name}"?`)) return;

                          try {
                            await deleteCategory(x.id);
                            await loadData();
                          } catch (e) {
                            setErr(e.message || "Delete failed");
                          }
                        }}
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

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 w-105"
          >
            <h2 className="text-amber-600 text-xl font-semibold mb-6">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            <input
              className="w-full border rounded-lg p-3 mb-4"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full border rounded-lg p-3 mb-6"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                  setName("");
                  setDescription("");
                }}
                className="px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-primary text-black px-4 py-2 rounded-lg"
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
