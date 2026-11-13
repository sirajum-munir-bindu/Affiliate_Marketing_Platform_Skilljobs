import type { Metadata } from "next";
import { AffiliateLayoutClient } from "@/components/affiliate/AffiliateLayoutClient";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DataService } from "@/lib/services/data-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icon.png?v=5", type: "image/png" },
      { url: "/favicon.ico?v=5", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=5",
    apple: "/apple-touch-icon.png?v=5",
  },
};

export default async function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/affiliate/dashboard");
  }

  // Check if role is AFFILIATE or ADMIN
  if (session.role !== "AFFILIATE" && session.role !== "ADMIN") {
    redirect("/affiliate/apply");
  }

  const marketer = await DataService.getMarketerByUserId(session.userId);
  const [payouts, commissions] = await Promise.all([
    DataService.getMarketerPayouts(marketer?.id || ""),
    DataService.getMarketerCommissions(marketer?.id || ""),
  ]);
  const pendingPayoutsCount = payouts.filter((p) => p.status === "REQUESTED").length;

  return (
    <AffiliateLayoutClient
      referralCode={marketer?.referralCode || session.referralCode}
      userName={session.name}
      userEmail={session.email}
      currentBalance={marketer?.currentBalance || 0}
      pendingPayoutsCount={pendingPayoutsCount}
      commissionsCount={commissions.length}
    >
      {children}
    </AffiliateLayoutClient>
  );
}
