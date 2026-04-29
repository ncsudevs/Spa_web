import { ArrowRight, Clock3, ShoppingBag } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../../shared/utils/formatters";
import { addToCart } from "../../../shared/utils/customerStorage";
import { launchCartFlight } from "../../../shared/utils/cartMotion";
import SmartServiceImage from "./SmartServiceImage";

export default function ServiceCard({ service, index = 0 }) {
  const imageRef = useRef(null);

  function handleQuickAdd() {
    launchCartFlight({
      imageSrc: service.imageUrl,
      sourceElement: imageRef.current,
      label: service.name,
    });
    addToCart(service);
  }

  return (
    <article
      className="group reveal-up overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,242,235,0.94))] shadow-[0_24px_54px_rgba(46,27,22,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_70px_rgba(46,27,22,0.14)]"
      style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
    >
      <div
        ref={imageRef}
        className="relative aspect-[4/4.2] overflow-hidden sm:aspect-[4/3.55]"
      >
        <SmartServiceImage
          src={service.imageUrl}
          alt={service.name}
          wrapperClassName="h-full w-full"
          imageClassName="h-full w-full transition duration-700"
          highResImageClassName="group-hover:scale-105"
          lowResImageClassName="rounded-[24px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/8 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          {service.category}
        </div>
        <button
          type="button"
          onClick={handleQuickAdd}
          className="soft-pill absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-white/88 text-stone-900 shadow-[0_12px_24px_rgba(35,20,18,0.16)] backdrop-blur"
          aria-label={`Add ${service.name} to cart`}
        >
          <ShoppingBag className="h-4.5 w-4.5" />
        </button>
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

        <div className="flex items-start justify-between gap-5">
          <p className="flex-1 text-sm leading-7 text-stone-600">
            Learn more about the treatment, then move into booking with confidence.
          </p>
          <div className="flex shrink-0 flex-col items-stretch gap-3">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="soft-pill inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Quick add
            </button>
            <Link
              to={`/services/${service.id}`}
              className="luxe-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(53,28,24,0.16)] transition hover:brightness-110"
            >
              View details
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
