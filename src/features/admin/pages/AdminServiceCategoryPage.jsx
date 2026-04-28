import { useState } from "react";
import { FolderOpen, Edit, Plus, Trash2 } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "../../services/api/serviceCategoryApi";
import AppButton from "../../../shared/components/AppButton";
import EmptyState from "../../../shared/components/EmptyState";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";
import TableScrollFrame from "../../../shared/components/TableScrollFrame";
import { useServiceCategories } from "../../services/hooks/useServiceCategories";

export default function ServiceCategoryPage() {
  const { categories: items, loading, error: loadError, reload } = useServiceCategories();
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function openCreate() {
    setEditingId(null);
    setName('');
    setDescription('');
    setError('');
    setOpen(true);
  }

  function openEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setError('');
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');

      if (!name.trim()) {
        setError('Name is required.');
        return;
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      if (editingId) await updateCategory(editingId, payload);
      else await createCategory(payload);

      closeModal();
      await reload();
    } catch (err) {
      setError(err.message || 'Save failed.');
    }
  }

  async function handleDelete(category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      setError('');
      await deleteCategory(category.id);
      await reload();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  }

  return (
    <div className="p-8 lg:p-12">
      <PageHeader
        eyebrow="Admin"
        title="Service categories"
        description="Organize services into clear groups so the menu stays easy to manage and browse."
        actions={<AppButton onClick={openCreate}><Plus size={18} /> Add category</AppButton>}
      />

      {error || loadError ? <p className="mb-4 text-sm text-red-600">{error || loadError}</p> : null}

      <SectionCard
        title="Category list"
        description="Update the groups used to organize services across the admin and customer pages."
      >
        {loading ? (
          <div className="py-8 text-sm text-stone-500">Loading categories...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No categories yet"
            description="Create categories first so services can be grouped neatly for admins and customers."
            action={<AppButton onClick={openCreate}><Plus size={16} /> Add category</AppButton>}
          />
        ) : (
          <TableScrollFrame scrollAreaClassName="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-stone-200 text-left text-sm text-stone-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((category, index) => (
                  <tr key={category.id} className={index !== items.length - 1 ? 'border-b border-stone-100' : ''}>
                    <td className="p-4 font-medium text-stone-900">{category.name}</td>
                    <td className="p-4 text-stone-600">{category.description || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <AppButton variant="ghost" className="px-3 py-2" onClick={() => openEdit(category)}>
                          <Edit size={16} />
                        </AppButton>
                        <AppButton variant="ghost" className="px-3 py-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(category)}>
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
                {editingId ? "Edit category" : "Add category"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Keep category names short and clear so they stay easy to scan.
              </p>
            </div>

            <div className="overflow-y-auto px-5 py-4 sm:px-8 sm:py-6">
              <label className="block text-sm text-stone-700">
                <span className="mb-2 block font-medium">Category name</span>
                <input
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="mt-4 block text-sm text-stone-700">
                <span className="mb-2 block font-medium">Description</span>
                <textarea
                  rows="4"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-rose-300"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-stone-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
              <AppButton type="button" variant="ghost" onClick={closeModal}>Cancel</AppButton>
              <AppButton type="submit">Save category</AppButton>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
