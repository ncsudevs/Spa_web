import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../features/admin/components/Sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-8">
        <div className="sticky top-3 z-30 mb-4 flex items-center justify-between rounded-3xl border border-stone-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
              Admin
            </p>
            <p className="text-sm font-semibold text-stone-900">
              Management console
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl border border-stone-200 p-2 text-stone-700 transition hover:bg-stone-100"
            aria-label="Open admin navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
