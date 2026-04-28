import { ArrowRight, CalendarCheck2, CreditCard, Scissors, UserRound, Users } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";
import { useAuth } from "../../../context/useAuth";

const adminCards = [
  {
    title: "Manage services",
    description: "Update pricing, availability slots, images, and visibility for the customer site.",
    to: "/admin/services",
    icon: Scissors,
  },
  {
    title: "Manage staff",
    description: "Review staffing capacity and keep assignment coverage healthy before busy slots.",
    to: "/admin/staff",
    icon: UserRound,
  },
  {
    title: "Manage customers",
    description: "Check customer records and resolve account-side booking issues from one place.",
    to: "/admin/customers",
    icon: Users,
  },
];

const opsCards = [
  {
    title: "Review bookings",
    description: "Confirm paid bookings, watch staffing readiness, and move appointments through check-in.",
    to: "/admin/bookings",
    icon: CalendarCheck2,
  },
  {
    title: "Review payments",
    description: "Approve bank transfers, handle refund actions, and keep payment state aligned with bookings.",
    to: "/admin/payments",
    icon: CreditCard,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const cards = isAdmin ? [...opsCards, ...adminCards] : opsCards;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Use this page as a quick starting point for the admin tasks your team handles most often."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Current role" className="p-5">
          <p className="text-2xl font-semibold text-stone-900">
            {user?.role || "ADMIN"}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            The links below adjust to the role you signed in with.
          </p>
        </SectionCard>
        <SectionCard title="Primary workflow" className="p-5">
          <p className="text-lg font-semibold text-stone-900">
            Payments {"->"} Bookings {"->"} Check-in
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Payment is confirmed first, then the booking moves forward to staffing and check-in.
          </p>
        </SectionCard>
        <SectionCard title="Batch 2 status" className="p-5">
          <p className="text-lg font-semibold text-stone-900">
            Ready to use
          </p>
          <p className="mt-2 text-sm text-stone-500">
            This dashboard now gives your team a simple place to jump into daily work.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Quick actions"
        description="Open the pages your team uses most often during day-to-day operations."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="group rounded-3xl border border-stone-200 bg-stone-50 p-5 transition hover:border-rose-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-stone-900">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
