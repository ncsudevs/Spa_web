import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Sparkles,
  Wallet,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getServiceById } from "../api/serviceApi";
import { mapServiceForUi } from "../utils/serviceMappers";
import { addToCart } from "../../../shared/utils/customerStorage";
import { formatCurrency } from "../../../shared/utils/formatters";

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

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        to="/services"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="aspect-[5/4] overflow-hidden">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm lg:p-10">
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
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
