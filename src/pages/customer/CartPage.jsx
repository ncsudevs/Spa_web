import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  readCart,
  removeCartItem,
  updateCartItem,
} from "../../utils/customerStorage";
import { useMemo, useState } from "react";

export default function CartPage() {
  // The cart is initialized lazily from localStorage to avoid an extra render on mount.
  const [cart, setCart] = useState(() => readCart());
  const navigate = useNavigate();

  // Derived totals are memoized because they only depend on cart changes.
  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0),
    [cart],
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
          <h1 className="text-3xl font-semibold text-stone-900">
            Your spa cart
          </h1>
          <div className="mt-8 space-y-5">
            {cart.map((item) => (
              <article
                key={item.service.id}
                className="flex flex-col gap-4 rounded-[28px] border border-stone-200 p-4 sm:flex-row"
              >
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
                      ${item.service.price} each
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
                      ${item.service.price * item.quantity}
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
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-4xl bg-stone-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Booking summary</h2>
          <div className="mt-6 space-y-3 text-sm text-stone-300">
            <div className="flex items-center justify-between">
              <span>Services</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Booking fee</span>
              <span>$0</span>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-xl font-semibold">
              <span>Total</span>
              <span>${subtotal}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/booking")}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            Continue to booking
          </button>
        </aside>
      </div>
    </div>
  );
}
