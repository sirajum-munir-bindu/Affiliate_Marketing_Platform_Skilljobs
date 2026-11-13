import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { Coins, CheckCircle2, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliateCommissionsPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const commissions = await DataService.getMarketerCommissions(marketer?.id || "");

  const approvedTotal = commissions
    .filter((c) => c.status === "APPROVED" || c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <span>অর্জিত কমিশনের বিস্তারিত লেজার</span>
            <span className="text-xs font-extrabold bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full">
              {formatBnNumber(commissions.length)} টি
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            আপনার রেফারেল লিংকের মাধ্যমে সম্পন্ন প্রতিটি বিক্রয়ের কমিশন হিস্ট্রি।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট কমিশন এন্ট্রি</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {formatBnNumber(commissions.length)} টি
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">অনুমোদিত মোট কমিশন</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {formatBDT(approvedTotal)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">বর্তমান ব্যালেন্স</p>
            <p className="text-2xl font-black text-[#2563EB] mt-0.5">
              {formatBDT(marketer?.currentBalance || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">কমিশন রেট</th>
                <th className="py-3.5 px-4">কমিশন পরিমাণ</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    কোনো কমিশন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                      {c.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{c.courseTitleBn}</td>
                    <td className="py-3.5 px-4 font-bold">{c.rate}%</td>
                    <td className="py-3.5 px-4 font-black text-[#16A34A]">
                      {formatBDT(c.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          c.status === "REVERSED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : c.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-[#16A34A] border-emerald-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
