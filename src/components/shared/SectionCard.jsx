// Reusable content container used to group related UI blocks into clean sections.
export default function SectionCard({ title, description, actions, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-6 shadow-sm ${className}`.trim()}>
      {/* Optional header area keeps title, description and actions aligned in the same layout pattern. */}
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-stone-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
