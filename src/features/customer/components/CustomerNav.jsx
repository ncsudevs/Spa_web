import {
  ArrowUpRight,
  LogOut,
  Menu,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { readCart } from "../../../shared/utils/customerStorage";

export default function CustomerNav() {
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const isCustomer = user?.role === "CUSTOMER";
  const isManagementUser = user?.role === "ADMIN" || user?.role === "CASHIER";
  const navItems = useMemo(() => {
    const items = [
      { to: "/", label: "Home" },
      { to: "/services", label: "Services" },
    ];

    if (isCustomer) {
      items.push({ to: "/my-bookings", label: "Bookings & Payment" });
    }

    return items;
  }, [isCustomer]);

  useEffect(() => {
    const syncCart = () => {
      const total = readCart().reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };
    let resetId = 0;
    const handleCartBounce = () => {
      window.clearTimeout(resetId);
      setIsCartBouncing(true);
      resetId = window.setTimeout(() => setIsCartBouncing(false), 760);
    };

    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener("cartBounce", handleCartBounce);

    return () => {
      window.clearTimeout(resetId);
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cartBounce", handleCartBounce);
    };
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card relative overflow-hidden rounded-[32px] border border-white/60 px-4 py-3 sm:px-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="group flex min-w-0 items-center gap-3 text-stone-900"
            >
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#2f201d,#6d2d3d_58%,#e09a67)] text-white shadow-[0_14px_34px_rgba(77,38,31,0.24)]">
                <span className="absolute inset-[1px] rounded-[17px] border border-white/20" />
                <Sparkles className="relative h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="font-display block truncate text-[1.4rem] leading-none">
                  SuSpa
                </span>
                <span className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
                  Signature Calm Rituals
                </span>
              </span>
            </Link>

            <nav className="hidden items-center md:flex">
              <div className="rounded-full border border-stone-200/70 bg-white/65 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-stone-950 text-white shadow-lg"
                            : "text-stone-600 hover:bg-rose-50 hover:text-rose-700"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <div className="hidden items-center gap-3 lg:flex">
                  <div className="rounded-full border border-stone-200/70 bg-white/65 px-4 py-2 text-sm text-stone-700">
                    <span className="text-stone-500">Hello, </span>
                    <span className="font-semibold">{user?.fullName}</span>
                  </div>
                  {isManagementUser && (
                    <Link
                      to="/admin/bookings"
                      className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-rose-200 hover:text-rose-700"
                    >
                      {user?.role === "CASHIER" ? "Cashier" : "Admin"}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/70 bg-white/70 text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    aria-label="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="hidden items-center gap-3 lg:flex">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-stone-700 transition hover:text-rose-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                  >
                    Join SuSpa
                  </Link>
                </div>
              )}

              {!isAuthenticated || isCustomer ? (
                <Link
                  to="/cart"
                  data-cart-target
                  className={`cart-target relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/70 bg-white/70 text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 ${
                    isCartBouncing ? "is-bouncing" : ""
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d9637b,#f3a05f)] px-1 text-[10px] font-bold text-white shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ) : null}

              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/70 bg-white/70 text-stone-700 md:hidden"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen ? (
          <div className="mt-3 rounded-[28px] border border-white/70 bg-white/88 p-3 shadow-[0_24px_60px_rgba(44,25,22,0.14)] backdrop-blur-xl md:hidden">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-stone-950 text-white"
                        : "text-stone-700 hover:bg-rose-50 hover:text-rose-700"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-3 rounded-[24px] bg-[linear-gradient(135deg,rgba(246,232,220,0.88),rgba(255,255,255,0.96))] p-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-stone-700">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-semibold text-stone-900">{user?.fullName}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Signed in
                      </p>
                    </div>
                  </div>
                  {isManagementUser ? (
                    <Link
                      to="/admin/bookings"
                      onClick={() => setIsOpen(false)}
                      className="mt-3 flex items-center justify-between rounded-2xl border border-stone-200/70 px-4 py-3 text-sm font-semibold text-stone-800"
                    >
                      {user?.role === "CASHIER"
                        ? "Cashier workspace"
                        : "Admin workspace"}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="mt-3 w-full rounded-2xl bg-stone-950 px-4 py-3 text-left text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="px-1 text-sm text-stone-600">
                    Step into a calmer booking experience.
                  </p>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-2xl bg-stone-950 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Join SuSpa
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-2xl border border-stone-200/70 px-4 py-3 text-center text-sm font-semibold text-stone-800"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
