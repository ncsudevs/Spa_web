import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/customer/ServiceCard';
import { useServices } from '../../hooks/useServices';

const highlights = [
  'Luxury treatments tailored to your mood',
  'Simple and elegant online booking flow',
  'Trusted therapists and premium care',
];

const customerTestimonials = [
  {
    id: 1,
    name: 'Linh Tran',
    quote:
      'The atmosphere feels premium and peaceful. Booking was simple and the service was excellent.',
  },
  {
    id: 2,
    name: 'Minh Hoang',
    quote:
      'I loved how easy it was to browse services and pick a time slot. The design feels very polished.',
  },
  {
    id: 3,
    name: 'Sarah Nguyen',
    quote:
      'My favorite part is the service detail page. Everything is clear, calm, and elegant.',
  },
];

export default function HomePage() {
  const { services, loading } = useServices({ mapForUi: true });

  // Featured services reuse the same data source as the services page for consistent visibility rules.
  const featuredServices = useMemo(() => services.slice(0, 3), [services]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent" />
        <img
          src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80"
          alt="Spa hero"
          className="h-[640px] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-rose-300" /> Elevated spa experiences
              </p>
              <h1 className="mt-6 text-5xl font-semibold leading-tight sm:text-6xl">
                Calm your body, refresh your mind, and glow with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-200">
                Browse curated treatments, discover your ideal self-care ritual, and book your next relaxing appointment in minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:bg-rose-100"
                >
                  Explore services <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Book now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[32px] bg-white p-8 shadow-sm lg:grid-cols-3 lg:p-10">
          {highlights.map((item) => (
            <div key={item} className="flex items-start gap-4 rounded-[28px] bg-stone-50 p-5">
              <div className="rounded-full bg-rose-100 p-2 text-rose-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium leading-6 text-stone-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Featured services</p>
            <h2 className="mt-3 text-4xl font-semibold text-stone-900">Popular treatments this week</h2>
          </div>
          <Link to="/services" className="hidden text-sm font-semibold text-stone-700 hover:text-rose-500 md:inline-flex">
            View all services
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 rounded-[28px] bg-white p-10 text-center text-stone-500 shadow-sm">
            Loading featured services...
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
            No active services available yet.
          </div>
        )}
      </section>

      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">Testimonials</p>
              <h2 className="mt-3 text-4xl font-semibold">What our guests say</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {customerTestimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
                <p className="text-base leading-7 text-stone-200">“{testimonial.quote}”</p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">{testimonial.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
