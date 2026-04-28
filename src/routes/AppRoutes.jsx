import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import DashboardPage from "../features/admin/pages/DashboardPage";
import LogsPage from "../features/admin/pages/LogsPage";
import AdminPaymentPage from "../features/admin/pages/AdminPaymentPage";
import AdminCustomersPage from "../features/admin/pages/AdminCustomersPage";
import AdminServiceCategoryPage from "../features/admin/pages/AdminServiceCategoryPage";
import AdminServicePage from "../features/admin/pages/AdminServicePage";
import AdminStaffPage from "../features/admin/pages/AdminStaffPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import BookingPage from "../features/bookings/pages/BookingPage";
import MyBookingsPage from "../features/bookings/pages/MyBookingsPage";
import CartPage from "../features/customer/pages/CartPage";
import HomePage from "../features/customer/pages/HomePage";
import PaymentPage from "../features/payments/pages/PaymentPage";
import MomoQrPage from "../features/payments/pages/MomoQrPage";
import ServiceDetailPage from "../features/services/pages/ServiceDetailPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLE_GROUPS, ROUTE_PATHS } from "./routeConfig";
import AdminBookingPage from "../features/admin/pages/AdminBookingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path={ROUTE_PATHS.home} element={<HomePage />} />
        <Route path={ROUTE_PATHS.services} element={<ServicesPage />} />
        <Route path={ROUTE_PATHS.serviceDetail} element={<ServiceDetailPage />} />
        <Route path={ROUTE_PATHS.cart} element={<CartPage />} />
        <Route
          path={ROUTE_PATHS.booking}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.customer}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.payment}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.customer}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.myBookings}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.customer}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.momoResult}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.customer}>
              <MomoQrPage />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
      </Route>

      <Route
        path={ROUTE_PATHS.adminRoot}
        element={
          <ProtectedRoute roles={ROLE_GROUPS.adminAndCashier}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to={ROUTE_PATHS.adminDashboard} replace />}
        />
        <Route
          path={ROUTE_PATHS.adminDashboard}
          element={<DashboardPage />}
        />
        <Route
          path={ROUTE_PATHS.adminServiceCategories}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.admin}>
              <AdminServiceCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminServices}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.admin}>
              <AdminServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminStaff}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.admin}>
              <AdminStaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminBookings}
          element={<AdminBookingPage />}
        />
        <Route
          path={ROUTE_PATHS.adminPayments}
          element={<AdminPaymentPage />}
        />
        <Route
          path={ROUTE_PATHS.adminCustomers}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.admin}>
              <AdminCustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminLogs}
          element={
            <ProtectedRoute roles={ROLE_GROUPS.admin}>
              <LogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
    </Routes>
  );
}
