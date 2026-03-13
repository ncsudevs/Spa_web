import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ServiceCard from "../../components/customer/ServiceCard";
import { getServices } from "../../api/serviceApi";
import { mapServiceForUi } from "../../data/serviceVisuals";

const highlights = [
  "Luxury treatments tailored to your mood",
  "Simple and elegant online booking flow",
  "Trusted therapists and premium care",
];

const customerTestimonials = [
  {
    id: 1,
    name: "Linh Tran",
    quote:
      "The atmosphere feels premium and peaceful. Booking was simple and the service was excellent.",
  },
  {
    id: 2,
    name: "Minh Hoang",
    quote:
      "I loved how easy it was to browse services and pick a time slot. The design feels very polished.",
  },
  {
    id: 3,
    name: "Sarah Nguyen",
    quote:
      "My favorite part is the service detail page. Everything is clear, calm, and elegant.",
  },
];

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedServices() {
      try {
        const data = await getServices();
        setFeaturedServices((data || []).slice(0, 3).map(mapServiceForUi));
      } catch (error) {
        console.error("Cannot load featured services from API:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedServices();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent" />
        <img
          src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80"
          alt="Spa hero"
          className="h-[640px] w-full object-cover"
        />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" /> Inspired by SereniSpa
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-tight sm:text-6xl">
                Serenity, beauty, and wellness in one seamless booking journey.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-stone-200">
                Discover restorative treatments, explore spa packages, and
                reserve your ideal appointment in a calm customer experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-400"
                >
                  Explore Services <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/my-bookings"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  View My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[32px] bg-white p-8 shadow-sm lg:grid-cols-3 lg:p-10">
          {highlights.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-3xl bg-stone-50 p-5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-rose-500" />
              <p className="text-sm font-medium leading-6 text-stone-700">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
              Featured
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">
              Popular spa treatments
            </h2>
          </div>
          <Link
            to="/services"
            className="hidden text-sm font-semibold text-stone-700 md:inline-flex"
          >
            See all services
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[28px] bg-white p-10 text-center text-stone-500 shadow-sm">
            Loading featured services...
          </div>
        ) : featuredServices.length === 0 ? (
          <div className="rounded-[28px] bg-white p-10 text-center text-stone-500 shadow-sm">
            No active services available yet.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              What customers love about this experience
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {customerTestimonials.map((item) => (
              <article
                key={item.id}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <p className="text-base leading-7 text-stone-200">
                  “{item.quote}”
                </p>
                <p className="mt-5 text-sm font-semibold text-white">
                  {item.name}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
