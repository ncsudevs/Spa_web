import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../shared/utils/formatters";

export default function ServiceCard({ service }) {
  return (
    <article className="group overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,242,235,0.94))] shadow-[0_24px_54px_rgba(46,27,22,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_70px_rgba(46,27,22,0.14)]">
      <div className="relative aspect-[4/4.2] overflow-hidden sm:aspect-[4/3.55]">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/8 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          {service.category}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-white">{service.name}</p>
            <p className="mt-2 max-w-[18rem] text-sm leading-6 text-stone-100/85">
              {service.shortDescription}
            </p>
          </div>
          <div className="rounded-[22px] bg-white/90 px-4 py-3 text-right text-stone-950 shadow-lg backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
              From
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(service.price)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5">
            <Clock3 className="h-4 w-4 text-rose-600" />
            {service.duration} min
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm">
            {service.slotCapacity || 5} slots / time
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="max-w-[16rem] text-sm leading-7 text-stone-600">
            Learn more about the treatment, then move into booking with confidence.
          </p>
          <Link
            to={`/services/${service.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#231614,#60303a_70%,#b56b4f)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(53,28,24,0.16)] transition hover:brightness-110"
          >
            View details
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
