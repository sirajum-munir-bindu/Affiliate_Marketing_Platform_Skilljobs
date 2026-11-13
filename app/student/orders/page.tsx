import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import Link from "next/link";
import { ShoppingBag, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentOrdersPage() {
  const session = await getSession();
  const data = await DataService.getStudentDashboardData(session?.userId || "");
  const paidOrders = data.orders.filter((o: any) => o.status === "PAID").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <span>আমার অর্ডার হিস্ট্রি</span>
            <span className="text-xs font-extrabold bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full">
              {formatBnNumber(data.orders.length)} টি
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            আপনার সকল কোর্স ক্রয়ের অর্ডার ও লেনদেন তালিকা।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">মোট অর্ডার</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {formatBnNumber(data.orders.length)} টি
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">সফল অর্ডার (PAID)</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {formatBnNumber(paidOrders)} টি
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500">অপেক্ষমাণ অর্ডার</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {formatBnNumber(data.orders.length - paidOrders)} টি
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
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
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">অর্ডার স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {data.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                data.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium">{o.courseTitleBn}</td>
                    <td className="py-3.5 px-4 font-black text-[#E53945]">
                      {formatBDT(o.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            o.status === "PAID"
                              ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {o.status}
                        </span>
                        {o.status === "PENDING_PAYMENT" && (
                          <Link
                            href="/student/payments"
                            className="text-[11px] font-bold text-[#2563EB] hover:underline"
                          >
                            TrxID জমা দিন
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
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
