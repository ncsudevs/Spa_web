// Visual tone map for status values shared across service, booking and payment screens.
const toneMap = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-stone-200 text-stone-700",
  PENDING: "bg-amber-100 text-amber-700",
  AWAITING_TRANSFER: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  PAID: "bg-emerald-100 text-emerald-700",
  UNPAID: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  REFUNDED: "bg-violet-100 text-violet-700",
  MOMO: "bg-fuchsia-100 text-fuchsia-700",
  BANK_TRANSFER: "bg-orange-100 text-orange-700",
  UNKNOWN: "bg-stone-100 text-stone-700",
};

// Shared badge component normalizes status values before rendering label and color.
export default function StatusBadge({ value, labels = {} }) {
  const normalized = (value || "UNKNOWN").toUpperCase();
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${toneMap[normalized] ?? "bg-stone-100 text-stone-700"}`}
    >
      {labels[normalized] ?? normalized}
    </span>
  );
}
