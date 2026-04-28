import { LogOut, Menu, ShoppingBag, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { readCart } from "../../../shared/utils/customerStorage";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/my-bookings", label: "My Bookings" },
];

export default function CustomerNav() {
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const syncCart = () => {
      const total = readCart().reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };

    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-stone-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>SuSpa</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-rose-600" : "text-stone-600 hover:text-stone-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="hidden items-center gap-3 md:flex">
              <div className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700">
                <span className="font-semibold">{user?.fullName}</span>
              </div>
              {user?.role === "ADMIN" && (
                <Link to="/admin/dashboard" className="text-sm font-semibold text-rose-600">
                  Admin
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login" className="text-sm font-semibold text-stone-700">Login</Link>
              <Link to="/register" className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">Register</Link>
            </div>
          )}

          <Link to="/cart" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-rose-100 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)} className={({ isActive }) => `rounded-xl px-3 py-3 text-sm font-medium ${isActive ? "bg-rose-50 text-rose-600" : "text-stone-700"}`}>
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <div className="mt-2 flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-stone-700">
                  <User className="h-4 w-4" /> {user?.fullName}
                </div>
                {user?.role === "ADMIN" && (
                  <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-rose-600">
                    Admin dashboard
                  </Link>
                )}
                <button type="button" onClick={() => { setIsOpen(false); handleLogout(); }} className="rounded-xl px-3 py-3 text-left text-sm font-medium text-stone-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-stone-700">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-rose-600">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
