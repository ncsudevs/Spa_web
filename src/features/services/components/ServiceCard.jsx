import { Clock3 } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/formatters";
import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-4/3 overflow-hidden">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
              {service.category}
            </span>
            <h3 className="mt-3 text-xl font-semibold text-stone-900">
              {service.name}
            </h3>
          </div>
          <span className="text-lg font-semibold text-rose-600">
            {formatCurrency(service.price)}
          </span>
        </div>
        <p className="text-sm leading-6 text-stone-600">
          {service.shortDescription}
        </p>
        <div className="flex items-center justify-between text-sm text-stone-500">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {service.duration} min
          </span>
          <span className="font-medium">{service.slotCapacity || 5} slots / time</span>
        </div>
        <Link
          to={`/services/${service.id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
