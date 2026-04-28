import { Outlet } from "react-router-dom";
import CustomerFooter from "../features/customer/components/CustomerFooter";
import CustomerNav from "../features/customer/components/CustomerNav";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#f8f5f1] text-stone-900">
      <CustomerNav />
      <main>
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
