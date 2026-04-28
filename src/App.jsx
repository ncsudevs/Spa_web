import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import "./App.css";
import HomePage from "./pages/customer/HomePage";
import ServicesPage from "./pages/customer/ServicesPage";
import ServiceDetailPage from "./pages/customer/ServiceDetailPage";
import CartPage from "./pages/customer/CartPage";
import BookingPage from "./pages/customer/BookingPage";
import PaymentPage from "./pages/customer/PaymentPage";
import MomoQrPage from "./pages/customer/MomoQrPage";
import MyBookingsPage from "./pages/customer/MyBookingsPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ServiceCategoryPage from "./pages/admin/ServiceCategoryPage";
import ServicePage from "./pages/admin/ServicePage";
import BookingAdminPage from "./pages/admin/BookingPage";
import PaymentAdminPage from "./pages/admin/PaymentPage";
import LogsPage from "./pages/admin/LogsPage";
import StaffPage from "./pages/admin/StaffPage";
import CustomersPage from "./pages/admin/CustomersPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/booking"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/momo/result"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <MomoQrPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN", "CASHIER"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={["ADMIN", "CASHIER"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="service-categories"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ServiceCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="services"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <ServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute roles={["ADMIN", "CASHIER"]}>
              <BookingAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute roles={["ADMIN", "CASHIER"]}>
              <PaymentAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="logs"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <LogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
