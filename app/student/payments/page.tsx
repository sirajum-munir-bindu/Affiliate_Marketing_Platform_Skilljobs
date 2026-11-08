import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT } from "@/lib/utilities/cn";
import { CheckCircle2, Clock, X, AlertCircle } from "lucide-react";

export default async function StudentPaymentsPage() {
  const session = await getSession();
  const data = await DataService.getStudentDashboardData(session?.userId || "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          পেমেন্ট ভেরিফিকেশন হিস্ট্রি
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার জমাকৃত bKash ট্রানজেকশন তথ্য এবং এডমিন যাচাইকরণ স্ট্যাটাস।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold text-[11px]">
                <th className="py-3 px-4">অর্ডার নং</th>
                <th className="py-3 px-4">কোর্স</th>
                <th className="py-3 px-4">প্রদত্ত পরিমাণ</th>
                <th className="py-3 px-4">প্রেরকের bKash নম্বর</th>
                <th className="py-3 px-4">TrxID</th>
                <th className="py-3 px-4">ভেরিফিকেশন স্ট্যাটাস</th>
                <th className="py-3 px-4">মন্তব্য / কারণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {data.payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো পেমেন্ট তথ্য জমা দেওয়া হয়নি।
                  </td>
                </tr>
              ) : (
                data.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{p.orderNumber}</td>
                    <td className="py-3 px-4 max-w-[180px] truncate">{p.courseTitleBn}</td>
                    <td className="py-3 px-4 font-black text-[#E53945]">{formatBDT(p.amount)}</td>
                    <td className="py-3 px-4 font-mono">{p.senderNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block my-2">
                      {p.transactionId}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === "APPROVED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> অনুমোদিত (সক্রিয়)
                        </span>
                      )}
                      {p.status === "SUBMITTED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> যাচাই অপেক্ষমান
                        </span>
                      )}
                      {p.status === "REJECTED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                          <X className="w-3 h-3" /> বাতিল
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {p.rejectionReason ? (
                        <span className="text-red-600 font-medium">কারণ: {p.rejectionReason}</span>
                      ) : p.status === "APPROVED" ? (
                        <span className="text-emerald-600 font-medium">ভেরিফিকেশন সফল</span>
                      ) : (
                        <span className="text-slate-400">পর্যালোচনায় রয়েছে</span>
                      )}
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
