import {
  ArrowRight,
  CalendarCheck2,
  CreditCard,
  RefreshCw,
  Scissors,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";
import { useAuth } from "../../../context/useAuth";
import AppButton from "../../../shared/components/AppButton";
import { getDashboardSummary } from "../api/dashboardApi";
import { formatCurrency, formatDateTime } from "../../../shared/utils/formatters";

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
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "ADMIN";
  const cards = isAdmin ? [...opsCards, ...adminCards] : opsCards;

  const statCards = useMemo(() => {
    if (!summary) return [];

    return [
      {
        label: "Paid revenue",
        value: formatCurrency(summary.paidRevenue),
        note: `${summary.paidPayments} paid payment(s)`,
      },
      {
        label: "Bookings in progress",
        value: String((summary.pendingBookings || 0) + (summary.confirmedBookings || 0)),
        note: `${summary.completedBookings || 0} completed`,
      },
      {
        label: "Awaiting payment review",
        value: String((summary.pendingPayments || 0) + (summary.awaitingTransferPayments || 0)),
        note: `${summary.awaitingTransferPayments || 0} awaiting transfer`,
      },
      {
        label: "Active team",
        value: String(summary.activeStaff || 0),
        note: `${summary.totalStaff || 0} total staff record(s)`,
      },
    ];
  }, [summary]);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardSummary();
      setSummary(data || null);
    } catch (err) {
      setError(err.message || "Cannot load dashboard summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="A quick operations overview for bookings, payments, staff readiness, and the admin actions your team uses most."
        actions={(
          <AppButton variant="ghost" onClick={loadSummary} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </AppButton>
        )}
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <SectionCard key={card.label} title={card.label} className="p-5">
            <p className="text-2xl font-semibold text-stone-900">{card.value}</p>
            <p className="mt-2 text-sm text-stone-500">{card.note}</p>
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Current role" className="p-5">
          <p className="text-2xl font-semibold text-stone-900">
            {user?.role || "ADMIN"}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Access in this area adjusts to the role you signed in with.
          </p>
        </SectionCard>
        <SectionCard title="Operating flow" className="p-5">
          <p className="text-lg font-semibold text-stone-900">
            Payments {"->"} Bookings {"->"} Staffing {"->"} Check-in
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Payment is confirmed first, then the team reviews staffing readiness and completes the visit during check-in.
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

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Recent bookings"
          description="The latest bookings help the team spot what needs payment review or operational follow-up."
        >
          {loading ? (
            <p className="text-sm text-stone-500">Loading booking summary...</p>
          ) : summary?.recentBookings?.length ? (
            <div className="space-y-3">
              {summary.recentBookings.map((item) => (
                <div
                  key={item.bookingId}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900">{item.bookingCode}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {item.status} / {item.paymentStatus}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-stone-700">{item.customerName}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {item.appointmentDate} - {item.appointmentTime} - {formatCurrency(item.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No recent booking data available.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Recent payments"
          description="This helps cashier/admin quickly confirm what was most recently paid or is still being reviewed."
        >
          {loading ? (
            <p className="text-sm text-stone-500">Loading payment summary...</p>
          ) : summary?.recentPayments?.length ? (
            <div className="space-y-3">
              {summary.recentPayments.map((item) => (
                <div
                  key={item.paymentId}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-stone-900">{item.paymentCode}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {item.method} / {item.status}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-stone-700">{item.bookingCode || "No booking code"}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatCurrency(item.amount)} - {formatDateTime(item.paidAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No recent payment data available.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
