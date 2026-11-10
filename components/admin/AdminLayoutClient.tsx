"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  pendingPaymentsCount?: number;
  pendingApplicationsCount?: number;
}

export function AdminLayoutClient({
  children,
  pendingPaymentsCount = 0,
  pendingApplicationsCount = 0,
}: AdminLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar with mobile drawer support */}
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        pendingPaymentsCount={pendingPaymentsCount}
        pendingApplicationsCount={pendingApplicationsCount}
      />

      {/* Main Content Area - Fixed height viewport with scrollable main */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <AdminHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          pendingPaymentsCount={pendingPaymentsCount}
          pendingApplicationsCount={pendingApplicationsCount}
        />

        {/* Dedicated smooth scroll container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
