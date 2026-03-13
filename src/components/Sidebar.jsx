import { Activity, CalendarCheck2, CreditCard, FileText, LayoutDashboard, Scissors, Tags } from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/service-categories", label: "Service Categories", icon: Tags },
  { to: "/admin/services", label: "Services", icon: Scissors },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/logs", label: "Logs", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-stone-800 bg-stone-950 px-5 py-6 text-stone-200">
      <div className="mb-8 flex items-center gap-3 px-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-white">SuSpa Admin</p>
          <p className="text-xs text-stone-500">Management console</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menu.map((m) => {
          const Icon = m.icon;
          return (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-stone-950 shadow-sm"
                    : "text-stone-400 hover:bg-stone-900 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {m.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
