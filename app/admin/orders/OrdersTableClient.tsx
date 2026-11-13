"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MockOrder } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import {
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingBag,
} from "lucide-react";

interface Props {
  initialOrders: MockOrder[];
}

export function OrdersTableClient({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<MockOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [orderToDelete, setOrderToDelete] = useState<MockOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.courseTitleBn.toLowerCase().includes(q) ||
        (o.marketerName && o.marketerName.toLowerCase().includes(q)) ||
        (o.marketerCode && o.marketerCode.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    const targetId = orderToDelete.id;
    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "অর্ডার ডিলিট ব্যর্থ হয়েছে");
      }

      setOrders((prev) => prev.filter((o) => o.id !== targetId));
      setFeedback({ type: "success", text: data.message });
      setOrderToDelete(null);
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
      setOrderToDelete(null);
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
            placeholder="অর্ডার নং, কাস্টমার, কোর্স বা মার্কেটার খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {["ALL", "PAID", "PAYMENT_REVIEW", "PENDING_PAYMENT", "CANCELLED"].map((st) => (
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
              {st === "ALL" ? `সকল (${formatBnNumber(orders.length)})` : st}
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
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">কাস্টমার</th>
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">রেফারেল পার্টনার</th>
                <th className="py-3.5 px-4">কমিশন (%)</th>
                <th className="py-3.5 px-4">অর্ডার স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">কোনো অর্ডার রেকর্ড পাওয়া যায়নি।</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500">{o.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate">{o.courseTitleBn}</td>
                    <td className="py-3.5 px-4 font-black text-[#E53945]">
                      {formatBDT(o.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {o.marketerName || o.marketerCode ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#172033]">
                            {o.marketerName || "অ্যাফিলিয়েট মার্কেটার"}
                          </p>
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
                      {o.commissionAmount > 0
                        ? `${formatBDT(o.commissionAmount)} (${o.commissionRate}%)`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          o.status === "PAID"
                            ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                            : o.status === "CANCELLED" || o.status === "REFUNDED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(o)}
                        title="অর্ডার রেকর্ড ডিলিট করুন"
                        aria-label={`অর্ডার ${o.orderNumber} ডিলিট করুন`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setOrderToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  অর্ডার রেকর্ড ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে অর্ডার{" "}
                  <strong className="text-slate-800">{orderToDelete.orderNumber}</strong> (
                  {orderToDelete.customerName} • {formatBDT(orderToDelete.price)}) এবং এর সাথে যুক্ত পেমেন্ট ও কমিশন রেকর্ড তালিকা থেকে মুছে ফেলতে চান?
                </p>
                {orderToDelete.status === "PAID" && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 font-medium">
                    সতর্কতা: এটি পরিশোধিত (PAID) অর্ডার — ডিলিট করলে শিক্ষার্থীর কোর্স অ্যাক্সেস প্রত্যাহার এবং যুক্ত হওয়া অ্যাফিলিয়েট কমিশন রিভার্স হয়ে যাবে।
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
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
