"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MockPayment } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import {
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Send
} from "lucide-react";

interface Props {
  initialPayments: MockPayment[];
  paidOrderIds: string[];
}

export function StudentPaymentsClient({ initialPayments, paidOrderIds }: Props) {
  const router = useRouter();
  const [payments, setPayments] = useState<MockPayment[]>(initialPayments);
  const [paidOrders] = useState<Set<string>>(new Set(paidOrderIds));

  // Resubmit modal state
  const [resubmitTarget, setResubmitTarget] = useState<MockPayment | null>(null);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleOpenResubmit = (p: MockPayment) => {
    setResubmitTarget(p);
    setSenderNumber(p.senderNumber || "");
    setTransactionId("");
    setCustomerNote("");
    setFeedback(null);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitTarget) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: resubmitTarget.orderId,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
          customerNote: customerNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "তথ্য জমা দিতে সমস্যা হয়েছে");
      }

      if (data.payment) {
        setPayments((prev) => [data.payment, ...prev]);
      }
      setFeedback({ type: "success", text: data.message });
      setResubmitTarget(null);
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if an order already has a newer SUBMITTED or APPROVED payment
  const hasActivePaymentForOrder = (orderId: string) =>
    paidOrders.has(orderId) ||
    payments.some(
      (p) => p.orderId === orderId && (p.status === "SUBMITTED" || p.status === "APPROVED")
    );

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">অর্ডার নং</th>
                <th className="py-3 px-4">কোর্স</th>
                <th className="py-3 px-4">প্রদত্ত পরিমাণ</th>
                <th className="py-3 px-4">প্রেরকের bKash নম্বর</th>
                <th className="py-3 px-4">TrxID</th>
                <th className="py-3 px-4">ভেরিফিকেশন স্ট্যাটাস</th>
                <th className="py-3 px-4">মন্তব্য / পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো পেমেন্ট তথ্য জমা দেওয়া হয়নি।
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const canRetry =
                    p.status === "REJECTED" && !hasActivePaymentForOrder(p.orderId);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">
                        {p.orderNumber}
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate">{p.courseTitleBn}</td>
                      <td className="py-3 px-4 font-black text-[#E53945]">
                        {formatBDT(p.amount)}
                      </td>
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
                        {p.status === "REJECTED" ? (
                          <div className="space-y-1.5">
                            {p.rejectionReason && (
                              <p className="text-red-600 font-medium">
                                কারণ: {p.rejectionReason}
                              </p>
                            )}
                            {canRetry && (
                              <button
                                type="button"
                                onClick={() => handleOpenResubmit(p)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>সঠিক TrxID পুনরায় জমা দিন</span>
                              </button>
                            )}
                          </div>
                        ) : p.status === "APPROVED" ? (
                          <span className="text-emerald-600 font-medium">ভেরিফিকেশন সফল</span>
                        ) : (
                          <span className="text-slate-400">পর্যালোচনায় রয়েছে</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESUBMIT TRXID MODAL */}
      {resubmitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isSubmitting && setResubmitTarget(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  সঠিক TrxID পুনরায় জমা দিন
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  অর্ডার <strong className="text-blue-600">{resubmitTarget.orderNumber}</strong> •{" "}
                  {formatBDT(resubmitTarget.amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setResubmitTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  প্রেরকের bKash নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  সঠিক ট্রানজেকশন আইডি (TrxID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder="যেমন: BK94X281LM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden font-mono uppercase font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="সঠিক TrxID পাঠানো হয়েছে..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setResubmitTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>পুনরায় জমা দিন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
