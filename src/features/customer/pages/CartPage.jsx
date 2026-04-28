import {
  CheckSquare,
  Minus,
  Plus,
  ShoppingBag,
  Square,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  readCart,
  removeCartItem,
  saveSelectedBookingItems,
  updateCartItem,
} from "../../../shared/utils/customerStorage";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../../shared/utils/formatters";

export default function CartPage() {
  const [cart, setCart] = useState(() => readCart());
  const [selectedIds, setSelectedIds] = useState(() =>
    readCart().map((item) => item.service.id),
  );
  const navigate = useNavigate();

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0),
    [cart],
  );

  const selectedCart = useMemo(() => {
    const validIds = selectedIds.filter((id) =>
      cart.some((item) => item.service.id === id),
    );
    const effectiveIds = validIds.length
      ? validIds
      : cart.map((item) => item.service.id);

    return cart.filter((item) => effectiveIds.includes(item.service.id));
  }, [cart, selectedIds]);

  const selectedSubtotal = useMemo(
    () =>
      selectedCart.reduce(
        (sum, item) => sum + item.service.price * item.quantity,
        0,
      ),
    [selectedCart],
  );

  const syncCart = () => setCart(readCart());

  const handleUpdateQuantity = (serviceId, nextQuantity) => {
    updateCartItem(serviceId, nextQuantity);
    syncCart();
  };

  const handleRemove = (serviceId) => {
    removeCartItem(serviceId);
    syncCart();
  };

  const toggleSelected = (serviceId) => {
    setSelectedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleContinueToBooking = () => {
    const effectiveIds = selectedIds.length
      ? selectedIds
      : cart.map((item) => item.service.id);

    saveSelectedBookingItems(effectiveIds);
    navigate("/booking");
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-4x1 bg-white p-12 shadow-sm">
          <ShoppingBag className="mx-auto h-12 w-12 text-rose-400" />
          <h1 className="mt-6 text-3xl font-semibold text-stone-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-stone-600">
            Start by choosing a treatment that matches your mood and wellness
            goals.
          </p>
          <Link
            to="/services"
            className="mt-8 inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Browse services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-4x1 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-3xl font-semibold text-stone-900">
              Your spa cart
            </h1>
            <p className="text-sm text-stone-500">
              Tick the services you want to book. If you leave everything
              unticked, SuSpa will use all services in your cart.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {cart.map((item) => {
              const isSelected = selectedIds.includes(item.service.id);

              return (
                <article
                  key={item.service.id}
                  className="flex flex-col gap-4 rounded-[28px] border border-stone-200 p-4 sm:flex-row"
                >
                  <button
                    type="button"
                    onClick={() => toggleSelected(item.service.id)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition ${
                      isSelected
                        ? "border-rose-300 bg-rose-50 text-rose-500"
                        : "border-stone-200 bg-white text-stone-400"
                    }`}
                    aria-label={`Select ${item.service.name}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  <img
                    src={item.service.imageUrl}
                    alt={item.service.name}
                    className="h-28 w-full rounded-3xl object-cover sm:w-40"
                  />
                  <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">
                        {item.service.name}
                      </h2>
                      <p className="mt-1 text-sm text-stone-500">
                        {item.service.duration} min •{" "}
                        {item.service.categoryName || item.service.category}
                      </p>
                      <p className="mt-3 text-sm text-stone-600">
                        {formatCurrency(item.service.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-full border border-stone-200 bg-stone-50 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.service.id,
                              item.quantity - 1,
                            )
                          }
                          className="rounded-full p-2 text-stone-600 hover:bg-white"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.service.id,
                              item.quantity + 1,
                            )
                          }
                          className="rounded-full p-2 text-stone-600 hover:bg-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="min-w-20 text-right text-lg font-semibold text-stone-900">
                        {formatCurrency(item.service.price * item.quantity)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.service.id)}
                        className="rounded-full p-3 text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="h-fit rounded-4xl bg-stone-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Booking summary</h2>
          <div className="mt-6 space-y-3 text-sm text-stone-300">
            <div className="flex items-center justify-between">
              <span>Services in cart</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Services to book</span>
              <span>{selectedCart.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cart subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Selected subtotal</span>
              <span>{formatCurrency(selectedSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Selection rule</span>
              <span>{selectedIds.length ? "Ticked items" : "All items"}</span>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-xl font-semibold">
              <span>Total</span>
              <span>{formatCurrency(selectedSubtotal)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleContinueToBooking}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            Continue to booking
          </button>
        </aside>
      </div>
    </div>
  );
}
