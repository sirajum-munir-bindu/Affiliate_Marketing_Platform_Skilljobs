import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";

export default async function AdminMarketersPage() {
  const marketers = await DataService.getAllMarketers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          অ্যাফিলিয়েট মার্কেটার তালিকা
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          অনুমোদিত সকল মার্কেটারের পারফরম্যান্স, ব্যালেন্স এবং রেফারেল কোড পর্যবেক্ষণ করুন।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">মার্কেটার</th>
                <th className="py-3.5 px-4">রেফারেল কোড</th>
                <th className="py-3.5 px-4">মোট ক্লিক</th>
                <th className="py-3.5 px-4">কনভার্সন</th>
                <th className="py-3.5 px-4">বর্তমান ব্যালেন্স</th>
                <th className="py-3.5 px-4">লাইফটাইম আর্নিং</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {marketers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold">{m.userName}</p>
                    <p className="text-[11px] text-slate-500">{m.userEmail}</p>
                    <p className="text-[11px] font-mono text-slate-500">{m.payoutAccountNo || m.userPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-[#2563EB] bg-blue-50/60 px-2 py-1 rounded inline-block my-2">
                    {m.referralCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold">{formatBnNumber(m.totalClicks)}</td>
                  <td className="py-3.5 px-4 font-bold text-[#E53945]">{formatBnNumber(m.totalConversions)} টি</td>
                  <td className="py-3.5 px-4 font-black text-[#16A34A]">{formatBDT(m.currentBalance)}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900">{formatBDT(m.lifetimeEarnings)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
