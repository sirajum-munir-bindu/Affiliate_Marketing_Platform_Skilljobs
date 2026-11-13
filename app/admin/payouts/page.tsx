import { DataService } from "@/lib/services/data-service";
import { PayoutSettlementTable } from "./PayoutSettlementTable";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const payouts = await DataService.getAllPayouts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          পে-আউট প্রসেসিং ও নিষ্পত্তি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          মার্কেটারদের জমা হওয়া উত্তোলন রিকোয়েস্ট পর্যালোচনা করুন ও bKash ট্রানজেকশন রেফারেন্স দিয়ে অনুমোদন, বাতিল, রিভার্স বা ডিলিট করুন।
        </p>
      </div>

      <PayoutSettlementTable initialPayouts={payouts} />
    </div>
  );
}
