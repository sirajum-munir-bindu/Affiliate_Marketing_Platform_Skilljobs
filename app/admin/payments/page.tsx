import { mockDb } from "@/lib/db/mock-data";
import { PaymentVerificationTable } from "./PaymentVerificationTable";
import { ShieldCheck } from "lucide-react";

export default function AdminPaymentsPage() {
  const payments = [...mockDb.payments]
    .map((p) => {
      const order = mockDb.orders.find((o) => o.id === p.orderId);
      return {
        ...p,
        marketerId: p.marketerId || order?.marketerId,
        marketerCode: p.marketerCode || order?.marketerCode,
        marketerName: p.marketerName || order?.marketerName,
        commissionAmount: p.commissionAmount ?? order?.commissionAmount,
        commissionRate: p.commissionRate ?? order?.commissionRate,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight">
            ম্যানুয়াল bKash পেমেন্ট ভেরিফিকেশন
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            শিক্ষার্থীদের জমাকৃত ট্রানজেকশন আইডি (TrxID) মিলিয়ে অনুমোদন বা বাতিল করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-[#16A34A] text-xs font-bold px-3.5 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>অটোমেটিক এনরোলমেন্ট ও অ্যাফিলিয়েট কমিশন কার্যকর সুরক্ষা</span>
        </div>
      </div>

      <PaymentVerificationTable initialPayments={payments} />
    </div>
  );
}
