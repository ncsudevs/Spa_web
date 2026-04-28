import {
  Activity,
  CalendarCheck2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Scissors,
  Tags,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";

const menu = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    to: "/admin/service-categories",
    label: "Service Categories",
    icon: Tags,
    roles: ["ADMIN"],
  },
  { to: "/admin/services", label: "Services", icon: Scissors, roles: ["ADMIN"] },
  { to: "/admin/customers", label: "Customers", icon: Users, roles: ["ADMIN"] },
  { to: "/admin/staff", label: "Staff", icon: UserRound, roles: ["ADMIN"] },
  {
    to: "/admin/bookings",
    label: "Bookings",
    icon: CalendarCheck2,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    to: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
    roles: ["ADMIN", "CASHIER"],
  },
  { to: "/admin/logs", label: "Logs", icon: FileText, roles: ["ADMIN"] },
];

function SidebarContent({
  mobile = false,
  onClose,
  onLogout,
  user,
  visibleMenu,
}) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-3 px-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-white">SuSpa Admin</p>
            <p className="text-xs text-stone-500">
              {user?.fullName || "Management console"}
            </p>
          </div>
        </div>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-900 hover:text-white"
            aria-label="Close admin navigation"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="space-y-2">
        {visibleMenu.map((m) => {
          const Icon = m.icon;
          return (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={onClose}
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

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-400 transition hover:bg-stone-900 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  );
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const visibleMenu = menu.filter((item) => item.roles.includes(user?.role));
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 flex-col overflow-y-auto border-r border-stone-800 bg-stone-950 px-5 py-6 text-stone-200 transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          mobile
          onClose={onClose}
          onLogout={handleLogout}
          user={user}
          visibleMenu={visibleMenu}
        />
      </aside>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 self-start overflow-y-auto border-r border-stone-800 bg-stone-950 px-5 py-6 text-stone-200 md:flex md:flex-col">
        <SidebarContent
          onClose={() => {}}
          onLogout={handleLogout}
          user={user}
          visibleMenu={visibleMenu}
        />
      </aside>
    </>
  );
}
