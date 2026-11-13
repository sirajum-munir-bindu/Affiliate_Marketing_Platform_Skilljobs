import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { DataService } from "@/lib/services/data-service";

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await DataService.getAdminOverviewStats();

  return (
    <AdminLayoutClient
      pendingPaymentsCount={stats.pendingPaymentsCount}
      pendingApplicationsCount={stats.pendingApplicationsCount}
    >
      {children}
    </AdminLayoutClient>
  );
}
