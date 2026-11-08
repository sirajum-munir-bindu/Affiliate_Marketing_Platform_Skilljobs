import { mockDb } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";

export default function AdminCommissionsPage() {
  const commissions = [...mockDb.commissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">মার্কেটার আইডি</th>
                <th className="py-3.5 px-4">কমিশন রেট</th>
                <th className="py-3.5 px-4">কমিশন পরিমাণ</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">{c.orderNumber}</td>
                  <td className="py-3.5 px-4 max-w-[200px] truncate">{c.courseTitleBn}</td>
                  <td className="py-3.5 px-4 font-mono">{c.marketerId}</td>
                  <td className="py-3.5 px-4 font-bold">{c.rate}%</td>
                  <td className="py-3.5 px-4 font-black text-[#16A34A]">{formatBDT(c.amount)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString("bn-BD")}
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
