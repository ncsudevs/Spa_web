import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SmartServiceImage from "../components/SmartServiceImage";
import { getServiceById } from "../api/serviceApi";
import { useServices } from "../hooks/useServices";
import { mapServiceForUi } from "../utils/serviceMappers";
import RevealSection from "../../../shared/components/RevealSection";
import { launchCartFlight } from "../../../shared/utils/cartMotion";
import { formatCurrency } from "../../../shared/utils/formatters";
import {
  addToCart,
  readCart,
  saveSelectedBookingItems,
} from "../../../shared/utils/customerStorage";

const faqEntries = [
  {
    question: "Is this treatment suitable for sensitive skin?",
    answer:
      "Yes. Let us know about sensitivity, allergies, or active concerns before the appointment so the team can adapt pressure, products, and pacing where needed.",
  },
  {
    question: "How early should I arrive?",
    answer:
      "Arriving around 10 minutes early helps the welcome, consultation, and treatment setup stay relaxed and on time.",
  },
  {
    question: "Can I book for more than one guest?",
    answer:
      "Yes. The booking size shown above reflects how many guests can reserve the same time slot for this treatment.",
  },
  {
    question: "What should I do before the appointment?",
    answer:
      "Come with any preferences or notes you want the team to know, and avoid rushing so the visit starts in a calmer rhythm.",
  },
];

function buildServiceSummary(service) {
  const summary =
    service.description?.trim() ||
    `${service.name} is a guided ${service.category.toLowerCase()} treatment designed to fit smoothly into your spa visit.`;

  return {
    summary,
    experiencePoints: [
      `A ${service.duration}-minute session prepared by our spa team.`,
      `Suitable for guests booking ${service.category.toLowerCase()} treatments and wanting a clear, structured visit.`,
      `You can share sensitivities, preferences, or notes before checkout so staff can prepare ahead of time.`,
    ],
    planningNotes: [
      `Price is ${formatCurrency(service.price)} per guest.`,
      `Up to ${service.slotCapacity || 5} guest(s) can reserve the same time slot for this service.`,
      "Arrive about 10 minutes early so check-in and treatment setup stay on time.",
    ],
    journeySteps: [
      {
        title: "Welcome & consultation",
        description:
          "We begin with a calm welcome and a quick check on comfort, goals, and preferences.",
      },
      {
        title: "Skin preparation",
        description:
          "The treatment area is prepared gently so the main service can feel smooth and considered.",
      },
      {
        title: "Main treatment",
        description:
          `Your ${service.duration}-minute service is delivered with a steady, unhurried pace and professional care.`,
      },
      {
        title: "Calming finish",
        description:
          "The session winds down softly so the result feels polished rather than abrupt.",
      },
      {
        title: "Aftercare advice",
        description:
          "You leave with simple guidance on how to maintain comfort and make the most of the treatment.",
      },
    ],
    reviews: [
      {
        name: "Linh Tran",
        rating: 5,
        relatedService: service.name,
        quote:
          "Everything felt calm and intentional. The treatment details were clear and the experience felt premium from the first minute.",
      },
      {
        name: "Minh Hoang",
        rating: 5,
        relatedService: service.name,
        quote:
          "The booking flow was easy, and the treatment itself felt polished and reassuring rather than rushed.",
      },
      {
        name: "Sarah Nguyen",
        rating: 4,
        relatedService: service.name,
        quote:
          "I liked how gentle and structured the whole visit felt. It gave me confidence before I even arrived.",
      },
    ],
  };
}

function RelatedServiceTile({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="group block w-[236px] shrink-0 overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,238,229,0.94))] shadow-[0_20px_50px_rgba(41,25,21,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(41,25,21,0.14)]"
    >
      <div className="relative h-[208px] overflow-hidden">
        <SmartServiceImage
          src={service.imageUrl}
          alt={service.name}
          wrapperClassName="h-full w-full"
          imageClassName="h-full w-full transition duration-700"
          highResImageClassName="group-hover:scale-105"
          lowResImageClassName="rounded-[22px]"
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
        <p className="text-sm leading-7 text-stone-600">
          {service.shortDescription}
        </p>
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

function ReviewCard({ review }) {
  return (
    <article className="w-[344px] shrink-0 rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_20px_50px_rgba(41,25,21,0.08)] xl:w-[360px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            {review.name}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rose-600">
            {review.relatedService}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[var(--gold-accent)]">
          {Array.from({ length: review.rating }).map((_, index) => (
            <Star key={`${review.name}-${index}`} className="h-4 w-4 fill-current" />
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm leading-7 text-stone-600">"{review.quote}"</p>
    </article>
  );
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const [isPrimaryCtaVisible, setIsPrimaryCtaVisible] = useState(true);
  const [isRelatedPaused, setIsRelatedPaused] = useState(false);
  const [isReviewPaused, setIsReviewPaused] = useState(false);
  const heroImageRef = useRef(null);
  const primaryCtaRef = useRef(null);
  const relatedCarouselRef = useRef(null);
  const reviewCarouselRef = useRef(null);
  const navigationTimeoutRef = useRef(0);
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

  useEffect(() => {
    const node = primaryCtaRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPrimaryCtaVisible(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [service]);

  useEffect(() => {
    function updateScrolledState() {
      setHasScrolledEnough(window.scrollY > 220);
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useEffect(() => {
    const controllers = [
      { ref: relatedCarouselRef, paused: isRelatedPaused, speed: 0.045 },
      { ref: reviewCarouselRef, paused: isReviewPaused, speed: 0.04 },
    ];

    const cleanups = controllers.map(({ ref, paused, speed }) => {
      const node = ref.current;
      if (!node) return () => {};

      let frameId = 0;
      let direction = 1;
      let lastTime = 0;

      const step = (time) => {
        if (!lastTime) lastTime = time;
        const delta = time - lastTime;
        lastTime = time;

        if (!paused) {
          const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
          if (maxScroll > 0) {
            const nextLeft = node.scrollLeft + direction * delta * speed;
            if (nextLeft >= maxScroll) {
              node.scrollLeft = maxScroll;
              direction = -1;
            } else if (nextLeft <= 0) {
              node.scrollLeft = 0;
              direction = 1;
            } else {
              node.scrollLeft = nextLeft;
            }
          }
        }

        frameId = window.requestAnimationFrame(step);
      };

      frameId = window.requestAnimationFrame(step);
      return () => window.cancelAnimationFrame(frameId);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [isRelatedPaused, isReviewPaused, service]);

  useEffect(() => {
    return () => window.clearTimeout(navigationTimeoutRef.current);
  }, []);

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

  const serviceSummary = useMemo(
    () => (service ? buildServiceSummary(service) : null),
    [service],
  );
  const showStickyBar = hasScrolledEnough && !isPrimaryCtaVisible;

  function handleAddToCart({ mode = "cart" } = {}) {
    if (!service) return;

    const cart = readCart();
    const alreadyInCart = cart.some((item) => item.service.id === service.id);

    if (mode === "book") {
      if (!alreadyInCart) {
        launchCartFlight({
          imageSrc: service.imageUrl,
          sourceElement: heroImageRef.current || primaryCtaRef.current,
          label: service.name,
        });
        addToCart(service);
      }

      saveSelectedBookingItems([service.id]);
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = window.setTimeout(() => {
        navigate("/booking");
      }, 760);
      return;
    }

    launchCartFlight({
      imageSrc: service.imageUrl,
      sourceElement: heroImageRef.current || primaryCtaRef.current,
      label: service.name,
    });
    addToCart(service);
  }

  function nudgeCarousel(ref, offset) {
    const node = ref.current;
    if (!node) return;
    node.scrollBy({ left: offset, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-500">
        Loading service detail...
      </div>
    );
  }

  if (!service || !serviceSummary) {
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
      <RevealSection as="div" className="mb-8" duration={0.55}>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>
      </RevealSection>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <RevealSection as="div" className="space-y-6 self-start" duration={0.7}>
          <div
            ref={heroImageRef}
            className="overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(45,27,23,0.08)]"
          >
            <div className="aspect-[5/4] overflow-hidden">
              <SmartServiceImage
                src={service.imageUrl}
                alt={service.name}
                wrapperClassName="h-full w-full"
                imageClassName="h-full w-full transition duration-700"
                highResImageClassName="scale-[1.01] hover:scale-[1.04]"
                lowResImageClassName="rounded-[24px]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
            <div className="float-card rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(246,233,224,0.95))] p-6 shadow-[0_20px_50px_rgba(45,27,23,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
                Treatment mood
              </p>
              <h2 className="font-display mt-3 text-3xl text-stone-950">
                Clean results, gentle care, and a calm pace from start to finish.
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                This treatment is presented with the same feeling the visit should
                create: clear, soft, and quietly premium.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_50px_rgba(45,27,23,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                Guest impression
              </p>
              <div className="mt-4 flex items-center gap-1 text-[var(--gold-accent)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="font-display mt-4 text-2xl leading-tight text-stone-950">
                "A polished treatment with a calm, reassuring feel from the first minute."
              </p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                SuSpa Signature Style
              </p>
            </div>
          </div>
        </RevealSection>

        <RevealSection as="div" duration={0.72}>
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
                <p className="font-semibold text-stone-900">{service.duration} min</p>
                <p className="mt-1 text-xs text-stone-500">Reserved treatment time</p>
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
                <p className="mt-1 text-xs text-stone-500">Available per time slot</p>
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

            <div ref={primaryCtaRef} className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleAddToCart({ mode: "cart" })}
                className="soft-pill inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3.5 text-sm font-semibold text-stone-900 shadow-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => handleAddToCart({ mode: "book" })}
                className="luxe-button inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(53,28,24,0.16)] transition hover:brightness-110"
              >
                Book now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </RevealSection>
      </div>

      <RevealSection as="section" className="mt-14" duration={0.65}>
        <div className="rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,240,233,0.94))] p-6 shadow-[0_24px_60px_rgba(45,27,23,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
                Treatment journey
              </p>
              <h2 className="font-display mt-3 text-4xl text-stone-950">
                A calmer flow from welcome to aftercare
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone-600">
              Every step is designed to feel smooth, considered, and easy to trust.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {serviceSummary.journeySteps.map((step, index) => (
              <RevealSection
                key={step.title}
                as="article"
                className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_40px_rgba(45,27,23,0.06)]"
                delay={0.06 * index}
                duration={0.6}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7d5cb,#ffffff)] text-sm font-bold text-stone-900 shadow-sm">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {step.description}
                </p>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      <div className="mt-14 grid items-start gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <RevealSection as="section" duration={0.62}>
          <div className="rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(45,27,23,0.08)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
              Questions
            </p>
            <h2 className="font-display mt-3 text-[2.55rem] leading-[0.98] text-stone-950 sm:text-[3rem]">
              Answers before you book
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-stone-600">
              The essentials are right here, so the decision feels clearer before
              you move into booking.
            </p>

            <div className="mt-8 space-y-3">
              {faqEntries.map((item, index) => {
                const isOpen = activeFaq === index;
                return (
                  <article
                    key={item.question}
                    className="overflow-hidden rounded-[24px] border border-stone-200 bg-stone-50"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-stone-900">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-stone-500 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-7 text-stone-600">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </RevealSection>

        <RevealSection as="section" duration={0.68}>
          <div className="rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,238,229,0.9))] p-6 shadow-[0_24px_60px_rgba(45,27,23,0.08)] sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
                  Guest reviews
                </p>
                <h2 className="font-display mt-3 text-4xl text-stone-950">
                  Small signals of trust
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
                  Real confidence often comes from small details: a clear flow,
                  calm pacing, and a treatment that feels considered before it
                  even begins.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => nudgeCarousel(reviewCarouselRef, -320)}
                  className="soft-pill inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm"
                  aria-label="Scroll reviews left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => nudgeCarousel(reviewCarouselRef, 320)}
                  className="soft-pill inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm"
                  aria-label="Scroll reviews right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="carousel-shell mt-8" data-paused={isReviewPaused ? "true" : "false"}>
              <div
                ref={reviewCarouselRef}
                className="carousel-track"
                onMouseEnter={() => setIsReviewPaused(true)}
                onMouseLeave={() => setIsReviewPaused(false)}
                onTouchStart={() => setIsReviewPaused(true)}
                onTouchEnd={() => setIsReviewPaused(false)}
              >
                {serviceSummary.reviews.map((review) => (
                  <ReviewCard key={`${review.name}-${review.relatedService}`} review={review} />
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/80 bg-white/82 px-5 py-4 shadow-[0_16px_36px_rgba(41,25,21,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Booking feel
                </p>
                <p className="mt-3 text-base font-semibold text-stone-900">
                  Clear and easy
                </p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/82 px-5 py-4 shadow-[0_16px_36px_rgba(41,25,21,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Treatment pace
                </p>
                <p className="mt-3 text-base font-semibold text-stone-900">
                  Gentle and structured
                </p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/82 px-5 py-4 shadow-[0_16px_36px_rgba(41,25,21,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Aftercare
                </p>
                <p className="mt-3 text-base font-semibold text-stone-900">
                  Simple guidance to follow
                </p>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>

      {relatedServices.length > 0 ? (
        <RevealSection as="section" className="mt-14" duration={0.66}>
          <div className="rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,238,229,0.9))] p-6 shadow-[0_24px_60px_rgba(45,27,23,0.08)] sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
                  You may also like
                </p>
                <h2 className="font-display mt-3 text-4xl text-stone-950">
                  More treatments that match the same calm mood
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-stone-600">
                Explore a few more treatments with a similar feel and discover what
                might suit your next visit.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => nudgeCarousel(relatedCarouselRef, -280)}
                className="soft-pill inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm"
                aria-label="Scroll related services left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => nudgeCarousel(relatedCarouselRef, 280)}
                className="soft-pill inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm"
                aria-label="Scroll related services right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div
              className="carousel-shell mt-5"
              data-paused={isRelatedPaused ? "true" : "false"}
            >
              <div
                ref={relatedCarouselRef}
                className="carousel-track"
                onMouseEnter={() => setIsRelatedPaused(true)}
                onMouseLeave={() => setIsRelatedPaused(false)}
                onTouchStart={() => setIsRelatedPaused(true)}
                onTouchEnd={() => setIsRelatedPaused(false)}
              >
                {relatedServices.map((item) => (
                  <RelatedServiceTile key={item.id} service={item} />
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      ) : null}

      {showStickyBar ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[80] px-3 sm:px-5 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[28px] border border-white/75 bg-white/90 p-3 shadow-[0_24px_60px_rgba(39,24,20,0.18)] backdrop-blur-xl">
            <div className="pointer-events-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">
                  {service.category}
                </p>
                <h3 className="truncate text-lg font-semibold text-stone-950">
                  {service.name}
                </h3>
                <p className="text-sm text-stone-600">
                  {service.duration} min · {formatCurrency(service.price)}
                </p>
              </div>
              <div className="grid shrink-0 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart({ mode: "cart" })}
                  className="soft-pill inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-900 shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart({ mode: "book" })}
                  className="luxe-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                >
                  Book now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
