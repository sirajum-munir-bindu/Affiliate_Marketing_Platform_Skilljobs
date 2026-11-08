import { mockDb } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";

export default function AdminOrdersPage() {
  const orders = [...mockDb.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          সকল অর্ডার হিস্ট্রি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          কাস্টমারদের কোর্স অর্ডার, অ্যাফিলিয়েট রেফারেন্স ও পেমেন্ট স্ট্যাটাস।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">কাস্টমার</th>
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">রেফারেল পার্টনার</th>
                <th className="py-3.5 px-4">কমিশন (%)</th>
                <th className="py-3.5 px-4">অর্ডার স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">{o.orderNumber}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold">{o.customerName}</p>
                    <p className="text-[11px] text-slate-500">{o.customerEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-[200px] truncate">{o.courseTitleBn}</td>
                  <td className="py-3.5 px-4 font-black text-[#E53945]">{formatBDT(o.price)}</td>
                  <td className="py-3.5 px-4">
                    {o.marketerName || o.marketerCode ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#172033]">{o.marketerName || "অ্যাফিলিয়েট মার্কেটার"}</p>
                        {o.marketerCode && (
                          <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-200 inline-block">
                            {o.marketerCode}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium inline-block">
                        সরাসরি (অরগ্যানিক)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#16A34A]">
                    {o.commissionAmount > 0 ? `${formatBDT(o.commissionAmount)} (${o.commissionRate}%)` : "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      o.status === "PAID"
                        ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {o.status}
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
