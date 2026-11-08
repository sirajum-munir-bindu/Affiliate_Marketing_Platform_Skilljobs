import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { PayoutRequestClient } from "./PayoutRequestClient";

export default async function AffiliatePayoutsPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const payouts = await DataService.getMarketerPayouts(marketer?.id || "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          টাকা উত্তোলন ও পে-আউট হিস্ট্রি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার অর্জিত ব্যালেন্স bKash বা ব্যাংকে সরাসরি উত্তোলন করুন।
        </p>
      </div>

      <PayoutRequestClient
        currentBalance={marketer?.currentBalance || 0}
        payoutAccountNo={marketer?.payoutAccountNo || ""}
        initialPayouts={payouts}
      />
    </div>
  );
}
