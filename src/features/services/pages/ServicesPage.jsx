import { useMemo, useRef, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import ServiceCard from "../components/ServiceCard";
import AppButton from "../../../shared/components/AppButton";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageHeader from "../../../shared/components/PageHeader";
import RevealSection from "../../../shared/components/RevealSection";
import SectionCard from "../../../shared/components/SectionCard";
import SkeletonBlock from "../../../shared/components/SkeletonBlock";
import { useServiceCategories } from "../hooks/useServiceCategories";
import { useServices } from "../hooks/useServices";

const PAGE_SIZE_OPTIONS = [
  { label: "3", value: "3" },
  { label: "15", value: "15" },
  { label: "All", value: "all" },
];

function ServicesGridSkeleton() {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 p-4 shadow-[0_20px_50px_rgba(41,25,21,0.08)]"
        >
          <SkeletonBlock className="aspect-[4/3] rounded-[24px]" />
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-3/4" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <div className="flex items-center justify-between pt-2">
              <SkeletonBlock className="h-10 w-28 rounded-full" />
              <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("15");
  const [resultsMotionKey, setResultsMotionKey] = useState(0);
  const resultsRef = useRef(null);
  const {
    categories,
    loading: categoriesLoading,
    error: categoryError,
    reload: reloadCategories,
  } = useServiceCategories();
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

  const effectivePageSize =
    pageSize === "all"
      ? Math.max(filteredServices.length, 1)
      : Number(pageSize);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / effectivePageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * effectivePageSize;
    return filteredServices.slice(startIndex, startIndex + effectivePageSize);
  }, [effectivePageSize, filteredServices, safeCurrentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
    }

    return [
      safeCurrentPage - 2,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      safeCurrentPage + 2,
    ];
  }, [safeCurrentPage, totalPages]);

  const rangeStart = filteredServices.length
    ? (safeCurrentPage - 1) * effectivePageSize + 1
    : 0;
  const rangeEnd = filteredServices.length
    ? Math.min(safeCurrentPage * effectivePageSize, filteredServices.length)
    : 0;

  function focusResults({ smooth = true } = {}) {
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    });
  }

  function handleSelectAll() {
    setCurrentPage(1);
    setSelectedCategory(null);
    setResultsMotionKey((value) => value + 1);
    reload(null).catch(() => {});
    focusResults();
  }

  function handleClearFilters() {
    setCurrentPage(1);
    setKeyword("");
    handleSelectAll();
  }

  function handleSelectCategory(category) {
    setCurrentPage(1);
    setSelectedCategory(category);
    setResultsMotionKey((value) => value + 1);
    focusResults();
  }

  function handleRetryServices() {
    reload(selectedCategory?.id ?? null).catch(() => {});
  }

  function handleRetryCategories() {
    reloadCategories().catch(() => {});
  }

  function handlePageChange(nextPage) {
    setCurrentPage(Math.max(1, Math.min(nextPage, totalPages)));
    focusResults({ smooth: true });
  }

  const hasFilters = Boolean(selectedCategory || keyword.trim());
  const showBlockingServiceError = Boolean(
    error && !services.length && !loading,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <RevealSection as="div" className="mb-10">
        <SectionCard>
          <PageHeader
            eyebrow="Services"
            title="Find your perfect treatment"
            description="Browse the treatments currently available and choose the one that fits your day."
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Reset button removes the category filter and requests the full service list again. */}
              <button
                type="button"
                onClick={handleSelectAll}
                className={`soft-pill rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory === null
                    ? "bg-stone-950 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                All
              </button>

              {categoriesLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonBlock
                      key={index}
                      className="h-11 w-24 rounded-full"
                    />
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                      className={`soft-pill rounded-full px-5 py-2.5 text-sm font-semibold transition ${
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
                id="service-search"
                name="service-search"
                value={keyword}
                onChange={(e) => {
                  setCurrentPage(1);
                  setKeyword(e.target.value);
                }}
                placeholder="Find your ritual..."
                className="h-12 w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-5 text-sm outline-none transition focus:border-rose-300"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-stone-200/70 pt-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <p>
                {filteredServices.length} treatment
                {filteredServices.length === 1 ? "" : "s"} found
              </p>
              {filteredServices.length > 0 ? (
                <p>
                  Showing {rangeStart}-{rangeEnd}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-stone-500">
                <span>Per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setPageSize(e.target.value);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 outline-none transition focus:border-rose-300"
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                Curated for a calmer booking flow
              </p>
            </div>
          </div>

          {categoryError ? (
            <ErrorState
              className="mt-6"
              title="Some service filters could not be loaded"
              description={`${categoryError} You can still browse services below, or reload the filters.`}
              actionLabel="Reload filters"
              onAction={handleRetryCategories}
            />
          ) : null}

          {error && !showBlockingServiceError ? (
            <ErrorState
              className="mt-6"
              title="We could not refresh the latest services"
              description={error}
              actionLabel="Retry services"
              onAction={handleRetryServices}
            />
          ) : null}
        </SectionCard>
      </RevealSection>

      {loading ? (
        <ServicesGridSkeleton />
      ) : showBlockingServiceError ? (
        <div ref={resultsRef} className="mt-8">
          <ErrorState
            title="We could not load services right now"
            description={error}
            actionLabel="Try again"
            onAction={handleRetryServices}
          />
        </div>
      ) : filteredServices.length > 0 ? (
        <div ref={resultsRef} className="mt-8">
          <div
            key={`${selectedCategory?.id ?? "all"}-${keyword}-${resultsMotionKey}-${safeCurrentPage}-${pageSize}`}
            className="reveal-up grid gap-8 md:grid-cols-2 xl:grid-cols-3"
          >
            {paginatedServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-10 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_50px_rgba(41,25,21,0.06)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500">
                Page {safeCurrentPage} of {totalPages}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <AppButton
                  variant="ghost"
                  className="rounded-full px-4"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                >
                  Previous
                </AppButton>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                      page === safeCurrentPage
                        ? "bg-stone-950 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <AppButton
                  variant="ghost"
                  className="rounded-full px-4"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                >
                  Next
                </AppButton>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div ref={resultsRef} className="mt-8">
          <EmptyState
            icon={Sparkles}
            title="No services matched your search"
            description="Try another keyword or choose a different category to explore more treatments."
            action={
              hasFilters ? (
                <AppButton
                  variant="ghost"
                  className="rounded-full px-5"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </AppButton>
              ) : null
            }
          />
        </div>
      )}
    </div>
  );
}
