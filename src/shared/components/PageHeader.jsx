export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-stone-600">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
