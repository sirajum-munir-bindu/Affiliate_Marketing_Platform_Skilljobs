import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBnNumber } from "@/lib/utilities/cn";
import { StudentPaymentsClient } from "./StudentPaymentsClient";

export const dynamic = "force-dynamic";

export default async function StudentPaymentsPage() {
  const session = await getSession();
  const data = await DataService.getStudentDashboardData(session?.userId || "");
  const paidOrderIds = data.orders
    .filter((o: any) => o.status === "PAID")
    .map((o: any) => o.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
          <span>পেমেন্ট ভেরিফিকেশন হিস্ট্রি</span>
          <span className="text-xs font-extrabold bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full">
            {formatBnNumber(data.payments.length)} টি
          </span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার জমাকৃত bKash ট্রানজেকশন তথ্য এবং এডমিন যাচাইকরণ স্ট্যাটাস। কোনো পেমেন্ট বাতিল হলে সঠিক TrxID পুনরায় জমা দিতে পারবেন।
        </p>
      </div>

      <StudentPaymentsClient
        initialPayments={data.payments}
        paidOrderIds={paidOrderIds}
      />
    </div>
  );
}
