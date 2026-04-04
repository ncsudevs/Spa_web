const CART_KEY = "spa_cart";
const CUSTOMER_EMAIL_KEY = "spa_customer_email";
const BOOKING_SELECTION_KEY = "spa_booking_selection";

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
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
  clearSelectedBookingItems();
}

export function saveCustomerEmail(email) {
  localStorage.setItem(CUSTOMER_EMAIL_KEY, email);
}

export function getSavedCustomerEmail() {
  return localStorage.getItem(CUSTOMER_EMAIL_KEY) || "";
}

export function saveSelectedBookingItems(serviceIds) {
  localStorage.setItem(BOOKING_SELECTION_KEY, JSON.stringify(serviceIds || []));
}

export function getSelectedBookingItems() {
  try {
    return JSON.parse(localStorage.getItem(BOOKING_SELECTION_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearSelectedBookingItems() {
  localStorage.removeItem(BOOKING_SELECTION_KEY);
}
