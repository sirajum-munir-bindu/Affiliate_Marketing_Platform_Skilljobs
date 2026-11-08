import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT } from "@/lib/utilities/cn";
import Link from "next/link";

export default async function StudentOrdersPage() {
  const session = await getSession();
  const data = await DataService.getStudentDashboardData(session?.userId || "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          আমার অর্ডার হিস্ট্রি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার সকল কোর্স ক্রয়ের অর্ডার ও লেনদেন তালিকা।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold text-[11px]">
                <th className="py-3 px-4">অর্ডার নং</th>
                <th className="py-3 px-4">কোর্স</th>
                <th className="py-3 px-4">মূল্য</th>
                <th className="py-3 px-4">অর্ডার স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {data.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{o.orderNumber}</td>
                    <td className="py-3 px-4 font-medium">{o.courseTitleBn}</td>
                    <td className="py-3 px-4 font-black text-[#E53945]">{formatBDT(o.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        o.status === "PAID"
                          ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString("bn-BD")}
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
