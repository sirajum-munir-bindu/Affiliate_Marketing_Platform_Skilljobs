import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { DataService } from "@/lib/services/data-service";

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
