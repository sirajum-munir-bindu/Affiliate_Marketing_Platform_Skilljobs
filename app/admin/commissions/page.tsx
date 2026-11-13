import { DataService } from "@/lib/services/data-service";
import { CommissionsTableClient } from "./CommissionsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminCommissionsPage() {
  const commissions = await DataService.getAllCommissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          কমিশন লেজার
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          প্রতিটি অনুমোদিত অর্ডারের বিপরীতে প্রদেয় অ্যাফিলিয়েট কমিশনের হিস্ট্রি।
        </p>
      </div>

      <CommissionsTableClient initialCommissions={commissions} />
    </div>
  );
}
