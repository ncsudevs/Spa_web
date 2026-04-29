export const ROLE_GROUPS = {
  customer: ["CUSTOMER"],
  admin: ["ADMIN"],
  adminAndCashier: ["ADMIN", "CASHIER"],
};

export const ROUTE_PATHS = {
  home: "/",
  services: "/services",
  serviceDetail: "/services/:id",
  cart: "/cart",
  booking: "/booking",
  payment: "/payment",
  myBookings: "/my-bookings",
  momoResult: "/payment/momo/result",
  login: "/login",
  register: "/register",
  adminRoot: "/admin",
  adminDashboard: "dashboard",
  adminServiceCategories: "service-categories",
  adminServices: "services",
  adminStaff: "staff",
  adminBookings: "bookings",
  adminPayments: "payments",
  adminCustomers: "customers",
};

export function getDefaultPathForRole(role) {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (role === "CASHIER") {
    return "/admin/bookings";
  }

  return ROUTE_PATHS.home;
}
