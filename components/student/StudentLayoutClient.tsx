"use client";

import { useState } from "react";
import { StudentSidebar } from "./StudentSidebar";
import { StudentHeader } from "./StudentHeader";

interface StudentLayoutClientProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  enrolledCount?: number;
  pendingPaymentsCount?: number;
  rejectedPaymentsCount?: number;
}

export function StudentLayoutClient({
  children,
  userName,
  userEmail,
  enrolledCount = 0,
  pendingPaymentsCount = 0,
  rejectedPaymentsCount = 0,
}: StudentLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F8FAFC]">
      <StudentSidebar
        userName={userName}
        userEmail={userEmail}
        enrolledCount={enrolledCount}
        pendingPaymentsCount={pendingPaymentsCount}
        rejectedPaymentsCount={rejectedPaymentsCount}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <StudentHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          userName={userName}
          enrolledCount={enrolledCount}
          pendingPaymentsCount={pendingPaymentsCount}
          rejectedPaymentsCount={rejectedPaymentsCount}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
