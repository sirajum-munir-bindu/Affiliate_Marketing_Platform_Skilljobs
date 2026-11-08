import { mockDb } from "@/lib/db/mock-data";
import { PayoutSettlementTable } from "./PayoutSettlementTable";

export default function AdminPayoutsPage() {
  const payouts = [...mockDb.payouts].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          পে-আউট প্রসেসিং ও নিষ্পত্তি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          মার্কেটারদের জমা হওয়া উত্তোলন রিকোয়েস্ট পর্যালোচনা করুন ও bKash ট্রানজেকশন রেফারেন্স দিয়ে পরিশোধ সম্পন্ন করুন।
        </p>
      </div>

      <PayoutSettlementTable initialPayouts={payouts} />
    </div>
  );
}
