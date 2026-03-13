import { useEffect, useMemo, useState } from "react";
import ServiceCard from "../../components/customer/ServiceCard";
import { getCategories } from "../../api/serviceCategoryApi";
import { getServices } from "../../api/serviceApi";
import { mapServiceForUi } from "../../data/serviceVisuals";

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");
        const [categoryData, serviceData] = await Promise.all([
          getCategories(),
          getServices(),
        ]);
        setCategories(categoryData || []);
        setServices((serviceData || []).map(mapServiceForUi));
      } catch (err) {
        console.error("Cannot load customer services:", err);
        setError(err.message || "Cannot connect to API.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadServicesByCategory() {
      try {
        setLoading(true);
        setError("");
        const serviceData = await getServices(selectedCategory?.id);
        setServices((serviceData || []).map(mapServiceForUi));
      } catch (err) {
        console.error("Cannot filter services from API:", err);
        setError(err.message || "Cannot filter services.");
      } finally {
        setLoading(false);
      }
    }

    if (selectedCategory !== null) {
      loadServicesByCategory();
    }
  }, [selectedCategory]);

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
      <div className="rounded-4x1 bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
          Services
        </p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-stone-900">
              Find your perfect treatment
            </h1>
            <p className="mt-3 max-w-2xl text-stone-600"></p>
          </div>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search services..."
            className="h-12 w-full rounded-full border border-stone-200 bg-stone-50 px-5 text-sm outline-none transition focus:border-rose-300 lg:max-w-xs"
          />
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={async () => {
              setSelectedCategory(null);
              setLoading(true);
              try {
                const serviceData = await getServices();
                setServices((serviceData || []).map(mapServiceForUi));
              } catch (err) {
                setError(err.message || "Cannot load services.");
              } finally {
                setLoading(false);
              }
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
      </div>

      {loading ? (
        <div className="mt-10 rounded-[28px] bg-white p-10 text-center text-stone-500 shadow-sm">
          Loading services...
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="mt-10 rounded-[28px] border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
              No services matched your search.
            </div>
          )}
        </>
      )}
    </div>
  );
}
