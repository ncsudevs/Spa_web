import {
  CalendarCheck2,
  CreditCard,
  LogOut,
  Activity,
  Bell,
  X,
  LayoutDashboard,
  Layers,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getBookings } from "../../bookings/api/bookingApi";
import { getPayments } from "../../payments/api/paymentApi";
import { useAuth } from "../../../context/useAuth";

const menu = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/service-categories",
    label: "Service Categories",
    icon: Layers,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/services",
    label: "Services",
    icon: Sparkles,
    roles: ["ADMIN"],
  },
  { to: "/admin/staff", label: "Staff", icon: Users, roles: ["ADMIN"] },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: UserRound,
    roles: ["ADMIN"],
  },
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
];

function SidebarContent({
  mobile = false,
  onClose,
  onLogout,
  user,
  visibleMenu,
  staffingAlertCount,
  paymentReviewCount,
}) {
  const totalAlertCount = staffingAlertCount + paymentReviewCount;

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
        <div className="flex items-center gap-2">
          <div className="relative rounded-full border border-stone-800 bg-stone-900/80 p-2 text-stone-300">
            <Bell className="h-4 w-4" />
            {totalAlertCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                {totalAlertCount > 9 ? "9+" : totalAlertCount}
              </span>
            ) : null}
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
      </div>

      {totalAlertCount > 0 ? (
        <div className="mb-5 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <p className="font-medium">Operations attention needed</p>
          <div className="mt-1 space-y-1 text-xs leading-5 text-rose-100/80">
            {staffingAlertCount > 0 ? (
              <p>
                {staffingAlertCount} paid booking{staffingAlertCount > 1 ? "s are" : " is"} still missing enough staff.
              </p>
            ) : null}
            {paymentReviewCount > 0 ? (
              <p>
                {paymentReviewCount} bank transfer payment{paymentReviewCount > 1 ? "s are" : " is"} waiting for cashier review.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <nav className="space-y-2">
        {visibleMenu.map((m) => {
          const Icon = m.icon;
          const isBookingLink = m.to === "/admin/bookings";
          const isPaymentLink = m.to === "/admin/payments";
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
              <span className="flex-1">{m.label}</span>
              {isBookingLink && staffingAlertCount > 0 ? (
                <span className="rounded-full bg-rose-500/15 px-2 py-1 text-[11px] font-semibold text-rose-300">
                  {staffingAlertCount}
                </span>
              ) : null}
              {isPaymentLink && paymentReviewCount > 0 ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-semibold text-amber-300">
                  {paymentReviewCount}
                </span>
              ) : null}
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
  const [staffingAlertCount, setStaffingAlertCount] = useState(0);
  const [paymentReviewCount, setPaymentReviewCount] = useState(0);
  const visibleMenu = menu.filter((item) => item.roles.includes(user?.role));
  const canTrackStaffingAlerts = useMemo(
    () => ["ADMIN", "CASHIER"].includes(user?.role),
    [user?.role],
  );
  const displayedStaffingAlertCount = canTrackStaffingAlerts
    ? staffingAlertCount
    : 0;

  useEffect(() => {
    if (!canTrackStaffingAlerts) return undefined;

    let ignore = false;

    async function loadStaffingAlerts() {
      try {
        const [bookings, payments] = await Promise.all([getBookings(), getPayments()]);
        if (ignore) return;

        // Alert only on active paid bookings because those are the ones that
        // should already be covered by internal staffing follow-up.
        const staffingCount = (bookings || []).filter(
          (booking) =>
            booking.paymentStatus === "PAID" &&
            !booking.isFullyStaffed &&
            !["CANCELLED", "COMPLETED"].includes(booking.status),
        ).length;

        const reviewCount = (payments || []).filter(
          (payment) =>
            payment.method === "BANK_TRANSFER" &&
            payment.status === "PENDING",
        ).length;

        setStaffingAlertCount(staffingCount);
        setPaymentReviewCount(reviewCount);
      } catch {
        if (!ignore) {
          setStaffingAlertCount(0);
          setPaymentReviewCount(0);
        }
      }
    }

    loadStaffingAlerts();
    const timerId = window.setInterval(loadStaffingAlerts, 60000);

    return () => {
      ignore = true;
      window.clearInterval(timerId);
    };
  }, [canTrackStaffingAlerts]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
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
          staffingAlertCount={displayedStaffingAlertCount}
          paymentReviewCount={canTrackStaffingAlerts ? paymentReviewCount : 0}
        />
      </aside>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 self-start overflow-y-auto border-r border-stone-800 bg-stone-950 px-5 py-6 text-stone-200 md:flex md:flex-col">
        <SidebarContent
          onClose={() => {}}
          onLogout={handleLogout}
          user={user}
          visibleMenu={visibleMenu}
          staffingAlertCount={displayedStaffingAlertCount}
          paymentReviewCount={canTrackStaffingAlerts ? paymentReviewCount : 0}
        />
      </aside>
    </>
  );
}
