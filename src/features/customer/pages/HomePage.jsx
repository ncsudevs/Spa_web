import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Sparkles,
  Star,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import RevealSection from "../../../shared/components/RevealSection";
import ServiceCard from "../../services/components/ServiceCard";
import { useServices } from "../../services/hooks/useServices";
import { formatCurrency } from "../../../shared/utils/formatters";

const signatureMoments = [
  {
    title: "Warm welcome",
    description: "A gentle, premium first impression from the second the page opens.",
    icon: Sparkles,
  },
  {
    title: "Fast booking flow",
    description: "Browse, choose, and confirm without fighting the interface.",
    icon: Clock3,
  },
  {
    title: "Trusted care",
    description: "Treatments presented with the same calm and confidence as the service itself.",
    icon: CheckCircle2,
  },
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
  const { services, loading } = useServices({ mapForUi: true });
  const featuredServices = useMemo(() => services.slice(0, 3), [services]);
  const heroService = featuredServices[0] || null;

  return (
    <div className="pb-10">
      <RevealSection as="section" className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="hero-glow reveal-up rounded-[40px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,249,243,0.96),rgba(247,232,220,0.95)_52%,rgba(243,217,196,0.92))] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-stone-700 shadow-sm">
                  <Sparkles className="h-4 w-4 text-[var(--rose-accent)]" />
                  Signature Calm Rituals
                </p>

                <h1 className="font-display mt-6 max-w-[10.5ch] text-[2.8rem] leading-[0.94] text-stone-950 sm:text-[3.9rem] lg:text-[4.8rem] xl:text-[5.15rem]">
                  A luxury spa booking experience shaped like a signature ritual.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                  SuSpa is designed like a signature ritual: warm visuals, smooth
                  actions, and a calm flow from discovery to payment.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/services"
                    className="luxe-button inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(62,30,27,0.22)] transition hover:brightness-110"
                  >
                    <span>Explore services</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/booking"
                    className="soft-pill inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-6 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    Book your visit
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="glass-card rounded-[26px] border border-white/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Atmosphere
                    </p>
                    <p className="font-display mt-3 text-3xl text-stone-950">
                      Editorial
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      Warm tones, soft motion, and a premium first impression.
                    </p>
                  </div>
                  <div
                    className="glass-card rounded-[26px] border border-white/70 p-4 reveal-up"
                    style={{ animationDelay: "0.08s" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Popular now
                    </p>
                    <p className="font-display mt-3 text-3xl text-stone-950">
                      {services.length || 0}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      Treatments ready to browse and book right away.
                    </p>
                  </div>
                  <div
                    className="glass-card rounded-[26px] border border-white/70 p-4 reveal-up"
                    style={{ animationDelay: "0.16s" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Guest rating
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-3xl text-stone-950">
                      <span className="font-display">4.9</span>
                      <Star className="h-5 w-5 fill-[var(--gold-accent)] text-[var(--gold-accent)]" />
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      Designed to feel polished, calm, and easy to trust.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[460px] lg:min-h-[560px]">
                <div className="float-card absolute left-0 top-0 w-[78%] overflow-hidden rounded-[34px] border border-white/70 bg-white/65 p-3 shadow-[0_28px_70px_rgba(53,31,26,0.16)]">
                  <div className="overflow-hidden rounded-[28px]">
                    <img
                      src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80"
                      alt="Spa treatment room"
                      className="h-[300px] w-full object-cover sm:h-[360px] lg:h-[420px]"
                    />
                  </div>
                </div>

                <div className="glass-card reveal-up absolute right-0 top-10 w-[48%] rounded-[28px] border border-white/70 p-5 shadow-[0_22px_52px_rgba(48,27,22,0.14)] lg:top-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Today&apos;s mood
                  </p>
                  <p className="font-display mt-3 text-2xl text-stone-950">
                    Soft light, slow pace, full reset.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    The interface mirrors the service: clean, warm, and quietly confident.
                  </p>
                </div>

                <div
                  className="glass-card reveal-up absolute bottom-5 left-6 w-[58%] rounded-[30px] border border-white/70 p-5 shadow-[0_22px_52px_rgba(48,27,22,0.14)]"
                  style={{ animationDelay: "0.12s" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Signature highlight
                  </p>
                  <p className="mt-3 text-lg font-semibold text-stone-950">
                    {heroService?.name || "Curated treatment selection"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                    <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
                      {heroService?.category || "Spa ritual"}
                    </span>
                    <span>{heroService?.duration || 60} min</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-stone-600">
                    {heroService?.shortDescription ||
                      "A refined introduction to the treatments guests are most likely to love first."}
                  </p>
                  <p className="mt-5 text-sm font-semibold text-stone-950">
                    {heroService ? formatCurrency(heroService.price) : "Ready to explore"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection
        as="section"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        delay={0.05}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {signatureMoments.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="reveal-up glass-card rounded-[30px] border border-white/70 p-6"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f7d5cb,#ffffff)] text-stone-900 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-stone-950">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </RevealSection>

      <RevealSection
        as="section"
        className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8"
        delay={0.08}
      >
        <div className="rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(249,240,233,0.86))] p-6 shadow-[0_28px_70px_rgba(53,31,26,0.08)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-600">
                Featured services
              </p>
              <h2 className="font-display mt-3 text-4xl text-stone-950 sm:text-5xl">
                Treatments curated to feel premium at first glance
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 transition hover:text-rose-700"
            >
              View all services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 rounded-[28px] bg-white/80 p-10 text-center text-stone-500 shadow-sm">
              Loading featured services...
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[28px] border border-dashed border-stone-300 bg-white/80 p-10 text-center text-stone-500">
              Our featured services will appear here soon.
            </div>
          )}
        </div>
      </RevealSection>

      <RevealSection
        as="section"
        className="bg-[linear-gradient(180deg,#241816,#120c0b)] py-20 text-white"
        delay={0.08}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-300">
                Guest impressions
              </p>
              <h2 className="font-display mt-3 text-4xl sm:text-5xl">
                The feeling should be memorable before the appointment starts
              </h2>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {customerTestimonials.map((testimonial, index) => (
              <article
                key={testimonial.id}
                className="reveal-up rounded-[30px] border border-white/10 bg-white/6 p-8 backdrop-blur-sm"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <p className="text-base leading-8 text-stone-200">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
                    {testimonial.name}
                  </p>
                  <div className="flex items-center gap-1 text-[var(--gold-accent)]">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
