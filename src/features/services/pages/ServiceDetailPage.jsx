import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Sparkles,
  Wallet,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getServiceById } from "../api/serviceApi";
import { mapServiceForUi } from "../utils/serviceMappers";
import { addToCart } from "../../../shared/utils/customerStorage";
import { formatCurrency } from "../../../shared/utils/formatters";
import { useServices } from "../hooks/useServices";

function buildServiceSummary(service) {
  const summary =
    service.description?.trim() ||
    `${service.name} is a guided ${service.category.toLowerCase()} treatment designed to fit smoothly into your spa visit.`;

  return {
    summary,
    experiencePoints: [
      `A ${service.duration}-minute session prepared by our spa team.`,
      `Suitable for guests booking ${service.category.toLowerCase()} treatments and wanting a clear, structured visit.`,
      `You can share skin sensitivities, preferences, or notes before checkout so staff can prepare ahead of time.`,
    ],
    planningNotes: [
      `Price is ${formatCurrency(service.price)} per guest.`,
      `Up to ${service.slotCapacity || 5} guest(s) can reserve the same time slot for this service.`,
      "Arrive about 10 minutes early so check-in and service setup stay on time.",
    ],
  };
}

function RelatedServiceTile({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="group block w-[280px] shrink-0 overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,238,229,0.94))] shadow-[0_20px_50px_rgba(41,25,21,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(41,25,21,0.14)]"
    >
      <div className="relative h-[208px] overflow-hidden">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          {service.category}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-display text-2xl text-white">{service.name}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm leading-7 text-stone-600">{service.shortDescription}</p>
        <div className="flex items-center justify-between gap-3 text-sm text-stone-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5">
            <Clock3 className="h-4 w-4 text-rose-600" />
            {service.duration} min
          </span>
          <span className="text-sm font-semibold text-stone-900">
            {formatCurrency(service.price)}
          </span>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
          View service
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { services } = useServices({ mapForUi: true });

  useEffect(() => {
    async function loadServiceDetail() {
      try {
        setLoading(true);
        setError("");
        const data = await getServiceById(id);
        setService(mapServiceForUi(data));
      } catch (err) {
        console.error("Cannot load service detail:", err);
        setError(err.message || "Service not found.");
      } finally {
        setLoading(false);
      }
    }

    loadServiceDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (!service) return;
    addToCart(service);
    navigate("/cart");
  };

  const relatedServices = useMemo(() => {
    if (!service) return [];

    const ranked = (services || [])
      .filter((item) => String(item.id) !== String(service.id))
      .sort((a, b) => {
        const aScore = a.category === service.category ? 1 : 0;
        const bScore = b.category === service.category ? 1 : 0;
        return bScore - aScore;
      });

    return ranked.slice(0, 6);
  }, [service, services]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-500">
        Loading service detail...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-stone-900">
          Service not found
        </h1>
        <p className="mt-3 text-stone-600">{error}</p>
        <Link
          to="/services"
          className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-3 text-white"
        >
          Back to services
        </Link>
      </div>
    );
  }

  const serviceSummary = buildServiceSummary(service);
  const marqueeItems =
    relatedServices.length > 1 ? [...relatedServices, ...relatedServices] : relatedServices;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        to="/services"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="self-start overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(45,27,23,0.08)]">
          <div className="aspect-[5/4] overflow-hidden">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-[0_24px_60px_rgba(45,27,23,0.08)] lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                {service.category}
              </span>
              <h1 className="mt-4 text-4xl font-semibold text-stone-900">
                {service.name}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-base leading-7 text-stone-600">
            {serviceSummary.summary}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-stone-50 p-4">
              <Clock3 className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Duration</p>
              <p className="font-semibold text-stone-900">
                {service.duration} min
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Reserved treatment time
              </p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <Wallet className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Price</p>
              <p className="font-semibold text-stone-900">
                {formatCurrency(service.price)}
              </p>
              <p className="mt-1 text-xs text-stone-500">Per guest</p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <UsersRound className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Booking size</p>
              <p className="font-semibold text-stone-900">
                Up to {service.slotCapacity || 5} guest(s)
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Available per time slot
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] bg-rose-50 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-rose-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">
                  What to expect
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {serviceSummary.experiencePoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-700"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-rose-500" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">
                  Before you book
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {serviceSummary.planningNotes.map((note) => (
                  <div
                    key={note}
                    className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-700"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#231614,#60303a_70%,#b56b4f)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(53,28,24,0.16)] transition hover:brightness-110"
          >
            Add to cart
          </button>
        </div>
      </div>

      {relatedServices.length > 0 ? (
        <section className="mt-14 rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,238,229,0.9))] p-6 shadow-[0_24px_60px_rgba(45,27,23,0.08)] sm:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
                You may also like
              </p>
              <h2 className="font-display mt-3 text-4xl text-stone-950">
                More treatments that match the same calm mood
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-stone-600">
              Explore a few more treatments with a similar feel and discover
              what might suit your next visit.
            </p>
          </div>

          <div className="marquee-shell mt-8">
            <div className="marquee-track gap-5">
              {marqueeItems.map((item, index) => (
                <RelatedServiceTile
                  key={`${item.id}-${index}`}
                  service={item}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
