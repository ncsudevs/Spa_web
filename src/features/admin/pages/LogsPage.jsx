import { CalendarCheck2, CreditCard, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../../shared/components/PageHeader";
import SectionCard from "../../../shared/components/SectionCard";

const fallbackLinks = [
  {
    to: "/admin/payments",
    label: "Payments",
    description: "Use this page to review bank-transfer confirmations, payment outcomes, and refund actions.",
    icon: CreditCard,
  },
  {
    to: "/admin/bookings",
    label: "Bookings",
    description: "Use this page to inspect the operational state of each booking, staffing, and check-in progression.",
    icon: CalendarCheck2,
  },
];

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Logs"
        description="This area is reserved for a future audit log. For now, use the pages below to review operational history."
      />

      <SectionCard
        title="What this means today"
        description="The route stays available for future work, while the current admin flow remains clear and usable."
      >
        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-stone-900">
                Detailed logs are not available yet
              </p>
              <p className="mt-2 text-sm text-stone-500">
                The clearest history right now lives in payment updates and booking progress. This page points your team to those areas directly.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Use these pages instead"
        description="These pages currently provide the most useful activity trail for daily operations."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {fallbackLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:border-rose-200 hover:bg-rose-50/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-lg font-semibold text-stone-900">
                    {item.label}
                  </p>
                </div>
                <p className="mt-3 text-sm text-stone-500">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
