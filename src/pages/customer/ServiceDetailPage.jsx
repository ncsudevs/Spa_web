import { ArrowLeft, CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getServiceById } from "../../api/serviceApi";
import StatusBadge from "../../components/shared/StatusBadge";
import { SERVICE_STATUS_LABELS } from "../../constants/serviceStatus";
import { mapServiceForUi } from "../../lib/service-mappers";
import { addToCart } from "../../utils/customerStorage";
import { formatCurrency } from "../../utils/formatters";

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

    // Detail page still applies the same mapper so image and status fields stay consistent with listing pages.
    loadServiceDetail();
  }, [id]);

  // Cart action stores the selected service before redirecting to the cart page.
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
            <StatusBadge
              value={service.status}
              labels={SERVICE_STATUS_LABELS}
            />
          </div>

          <p className="mt-4 text-base leading-7 text-stone-600">
            {service.description}
          </p>

          {/* Summary cards present the most important booking information without sending users to another screen. */}
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl bg-stone-50 p-4">
              <Clock3 className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Duration</p>
              <p className="font-semibold text-stone-900">
                {service.duration} min
              </p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Status</p>
              <div className="mt-2">
                <StatusBadge
                  value={service.status}
                  labels={SERVICE_STATUS_LABELS}
                />
              </div>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <CalendarDays className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Price</p>
              <p className="font-semibold text-stone-900">
                {formatCurrency(service.price)}
              </p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              <p className="mt-3 text-sm text-stone-500">Capacity</p>
              <p className="font-semibold text-stone-900">
                {service.slotCapacity || 5} / time
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] bg-rose-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">
              Service information
            </p>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700">
                <ShieldCheck className="h-4 w-4 text-rose-500" />
                <span>{service.info}</span>
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
