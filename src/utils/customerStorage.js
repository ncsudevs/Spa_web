const CART_KEY = "spa_cart";
const CUSTOMER_EMAIL_KEY = "spa_customer_email";

// Cart state stays in localStorage so the customer flow survives page refreshes
// without introducing global state management for a small project.
export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(service) {
  const cart = readCart();
  const existing = cart.find((item) => item.service.id === service.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ service, quantity: 1 });
  }

  writeCart(cart);
}

export function updateCartItem(serviceId, quantity) {
  const cart = readCart().map((item) =>
    item.service.id === serviceId
      ? { ...item, quantity: Math.max(1, quantity) }
      : item,
  );

  writeCart(cart);
}

export function removeCartItem(serviceId) {
  writeCart(readCart().filter((item) => item.service.id !== serviceId));
}

export function clearCart() {
  writeCart([]);
}

// The latest customer email is stored locally so "My Bookings" can reload data after payment.
export function saveCustomerEmail(email) {
  localStorage.setItem(CUSTOMER_EMAIL_KEY, email);
}

export function getSavedCustomerEmail() {
  return localStorage.getItem(CUSTOMER_EMAIL_KEY) || "";
}
