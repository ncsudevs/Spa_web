import { Outlet } from "react-router-dom";
import CustomerFooter from "../features/customer/components/CustomerFooter";
import CustomerNav from "../features/customer/components/CustomerNav";
import CartFlightOverlay from "../shared/components/CartFlightOverlay";
import ScrollProgressBar from "../shared/components/ScrollProgressBar";

export default function CustomerLayout() {
  return (
    <div className="customer-shell min-h-screen bg-[var(--canvas)] text-stone-900">
      <ScrollProgressBar />
      <div className="ambient-grid pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] opacity-50" />
      <div className="relative z-10">
        <CustomerNav />
        <main>
          <Outlet />
        </main>
        <CustomerFooter />
      </div>
      <CartFlightOverlay />
    </div>
  );
}
