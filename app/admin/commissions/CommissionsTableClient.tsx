"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MockCommission } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import {
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Coins
} from "lucide-react";

export interface EnrichedCommission extends MockCommission {
  marketerName: string;
  marketerCode?: string;
}

interface Props {
  initialCommissions: EnrichedCommission[];
}

export function CommissionsTableClient({ initialCommissions }: Props) {
  const router = useRouter();
  const [commissions, setCommissions] = useState<EnrichedCommission[]>(initialCommissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [commissionToDelete, setCommissionToDelete] = useState<EnrichedCommission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredCommissions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return commissions.filter((c) => {
      const matchesSearch =
        !q ||
        c.orderNumber.toLowerCase().includes(q) ||
        c.courseTitleBn.toLowerCase().includes(q) ||
        c.marketerName.toLowerCase().includes(q) ||
        (c.marketerCode && c.marketerCode.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [commissions, searchTerm, statusFilter]);

  const handleConfirmDelete = async () => {
    if (!commissionToDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/commissions?id=${commissionToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "ডিলিট ব্যর্থ হয়েছে");
      }

      setCommissions((prev) => prev.filter((c) => c.id !== commissionToDelete.id));
      setFeedback({ type: "success", text: data.message });
      setCommissionToDelete(null);
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
      setCommissionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0]">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="অর্ডার নং, কোর্স বা মার্কেটারের নাম খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {["ALL", "APPROVED", "PENDING", "PAID", "REVERSED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                statusFilter === st
                  ? "bg-[#172033] text-white border-[#172033]"
                  : "bg-white text-[#64748B] border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "ALL" ? `সকল (${formatBnNumber(commissions.length)})` : st}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">মার্কেটারের নাম</th>
                <th className="py-3.5 px-4">কমিশন রেট</th>
                <th className="py-3.5 px-4">কমিশন পরিমাণ</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4">তারিখ</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">কোনো কমিশন রেকর্ড পাওয়া যায়নি।</p>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((c) => {
                  const isPaid = c.status === "PAID";
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                        {c.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate">{c.courseTitleBn}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#172033]">{c.marketerName}</p>
                        {c.marketerCode && (
                          <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                            {c.marketerCode}
                          </span>
                        )}
                      </td>
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
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isPaid}
                          onClick={() => setCommissionToDelete(c)}
                          title={
                            isPaid
                              ? "পে-আউট সম্পন্ন হওয়া কমিশন ডিলিট করা যাবে না"
                              : "কমিশন রেকর্ড ডিলিট করুন"
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {commissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setCommissionToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  কমিশন রেকর্ড ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে অর্ডার{" "}
                  <strong className="text-slate-800">{commissionToDelete.orderNumber}</strong> এর{" "}
                  <strong className="text-slate-800">
                    {formatBDT(commissionToDelete.amount)}
                  </strong>{" "}
                  কমিশন ({commissionToDelete.marketerName}) লেজার থেকে ডিলিট করতে চান?
                </p>
                {commissionToDelete.status === "APPROVED" && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 font-medium">
                    সতর্কতা: এটি অনুমোদিত কমিশন — ডিলিট করলে মার্কেটারের বর্তমান ব্যালেন্স ও লাইফটাইম আর্নিং থেকে{" "}
                    {formatBDT(commissionToDelete.amount)} সমন্বয় (বিয়োগ) করা হবে।
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCommissionToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>হ্যাঁ, ডিলিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
