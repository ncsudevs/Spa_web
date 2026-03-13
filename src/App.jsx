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
import MyBookingsPage from "./pages/customer/MyBookingsPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ServiceCategoryPage from "./pages/admin/ServiceCategoryPage";
import ServicePage from "./pages/admin/ServicePage";
import BookingAdminPage from "./pages/admin/BookingPage";
import PaymentAdminPage from "./pages/admin/PaymentPage";
import LogsPage from "./pages/admin/LogsPage";

function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="service-categories" element={<ServiceCategoryPage />} />
        <Route path="services" element={<ServicePage />} />
        <Route path="bookings" element={<BookingAdminPage />} />
        <Route path="payments" element={<PaymentAdminPage />} />
        <Route path="logs" element={<LogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
