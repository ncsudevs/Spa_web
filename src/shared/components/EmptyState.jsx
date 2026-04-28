export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="h-7 w-7 text-stone-500" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
