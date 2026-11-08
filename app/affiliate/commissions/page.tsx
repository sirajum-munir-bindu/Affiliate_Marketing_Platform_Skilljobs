import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT } from "@/lib/utilities/cn";

export default async function AffiliateCommissionsPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const commissions = await DataService.getMarketerCommissions(marketer?.id || "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          অর্জিত কমিশনের বিস্তারিত লেজার
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার রেফারেল লিংকের মাধ্যমে সম্পন্ন প্রতিটি বিক্রয়ের কমিশন হিস্ট্রি।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold text-[11px]">
                <th className="py-3 px-4">অর্ডার নং</th>
                <th className="py-3 px-4">কোর্স</th>
                <th className="py-3 px-4">কমিশন রেট</th>
                <th className="py-3 px-4">কমিশন পরিমাণ</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    কোনো কমিশন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{c.orderNumber}</td>
                    <td className="py-3 px-4 font-medium">{c.courseTitleBn}</td>
                    <td className="py-3 px-4 font-bold">{c.rate}%</td>
                    <td className="py-3 px-4 font-black text-[#16A34A]">{formatBDT(c.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
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
