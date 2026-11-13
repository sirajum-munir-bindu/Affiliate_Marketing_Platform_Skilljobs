import { DataService } from "@/lib/services/data-service";
import { ApplicationsTable } from "./ApplicationsTable";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await DataService.getAffiliateApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          অ্যাফিলিয়েট আবেদন ম্যানেজমেন্ট
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          নতুন অ্যাফিলিয়েট আবেদনকারীদের প্রোফাইল যাচাই করুন এবং অনুমোদন বা বাতিল করুন।
        </p>
      </div>

      <ApplicationsTable initialApplications={applications} />
    </div>
  );
}
