"use client";

import { useState } from "react";
import { AffiliateSidebar } from "./AffiliateSidebar";
import { AffiliateHeader } from "./AffiliateHeader";

interface AffiliateLayoutClientProps {
  children: React.ReactNode;
  referralCode?: string;
  userName?: string;
  userEmail?: string;
  currentBalance?: number;
  pendingPayoutsCount?: number;
  commissionsCount?: number;
}

export function AffiliateLayoutClient({
  children,
  referralCode,
  userName,
  userEmail,
  currentBalance = 0,
  pendingPayoutsCount = 0,
  commissionsCount = 0,
}: AffiliateLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#F8FAFC]">
      <AffiliateSidebar
        referralCode={referralCode}
        userName={userName}
        userEmail={userEmail}
        pendingPayoutsCount={pendingPayoutsCount}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <AffiliateHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          userName={userName}
          referralCode={referralCode}
          currentBalance={currentBalance}
          pendingPayoutsCount={pendingPayoutsCount}
          commissionsCount={commissionsCount}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
