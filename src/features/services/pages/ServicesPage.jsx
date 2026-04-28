import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import ServiceCard from "../components/ServiceCard";
import EmptyState from "../../../shared/components/EmptyState";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";
import { useServiceCategories } from "../hooks/useServiceCategories";
import { useServices } from "../hooks/useServices";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [keyword, setKeyword] = useState("");
  const { categories } = useServiceCategories();
  const { services, loading, error, reload } = useServices({
    categoryId: selectedCategory?.id ?? null,
    mapForUi: true,
  });

  // Client-side filter keeps the search input responsive without requiring a new request on every keystroke.
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesKeyword =
        service.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (service.description || "")
          .toLowerCase()
          .includes(keyword.toLowerCase());

      const matchesCategory =
        !selectedCategory || service.categoryId === selectedCategory.id;
      return matchesKeyword && matchesCategory;
    });
  }, [keyword, selectedCategory, services]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionCard>
        <PageHeader
          eyebrow="Services"
          title="Find your perfect treatment"
          description="Customer pages now consume the same service hook and mapper, and only ACTIVE services can appear here."
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {/* Reset button removes the category filter and requests the full service list again. */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                reload(null).catch(() => {});
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === null
                  ? "bg-stone-950 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory?.id === category.id
                    ? "bg-stone-950 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <label className="relative block w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search services..."
              className="h-12 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-5 text-sm outline-none transition focus:border-rose-300"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        ) : null}
      </SectionCard>

      {loading ? (
        <div className="mt-10 rounded-[28px] bg-white p-10 text-center text-stone-500 shadow-sm">
          Loading services...
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={Sparkles}
            title="No services matched your search"
            description="Try another keyword or switch to a different category. Hidden services stay invisible here until an admin sets them back to ACTIVE."
          />
        </div>
      )}
    </div>
  );
}
