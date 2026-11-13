"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MockPayment } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import {
  Check,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  UserCheck,
  RotateCcw,
  Loader2,
  ShieldAlert,
  Trash2
} from "lucide-react";

interface Props {
  initialPayments: MockPayment[];
}

export function PaymentVerificationTable({ initialPayments }: Props) {
  const router = useRouter();
  const [payments, setPayments] = useState<MockPayment[]>(initialPayments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Approve confirmation modal state
  const [paymentToApprove, setPaymentToApprove] = useState<MockPayment | null>(null);

  // Revert mistaken approval modal state
  const [paymentToRevert, setPaymentToRevert] = useState<MockPayment | null>(null);
  const [revertTargetStatus, setRevertTargetStatus] = useState<"SUBMITTED" | "REJECTED">("SUBMITTED");
  const [revertReason, setRevertReason] = useState("ভুলবশত অনুমোদন করা হয়েছিল");
  const [isReverting, setIsReverting] = useState(false);

  // Resolve rejected payment modal state (edit TrxID / senderNumber & re-approve)
  const [paymentToResolve, setPaymentToResolve] = useState<MockPayment | null>(null);
  const [resolveTrxId, setResolveTrxId] = useState("");
  const [resolveSenderNumber, setResolveSenderNumber] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Delete payment modal state
  const [paymentToDelete, setPaymentToDelete] = useState<MockPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.senderNumber.includes(searchTerm) ||
      p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.marketerName && p.marketerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.marketerCode && p.marketerCode.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && p.status === filterStatus;
  });

  const handleConfirmApprove = async () => {
    if (!paymentToApprove) return;
    const paymentId = paymentToApprove.id;
    setLoadingId(paymentId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "অনুমোদন ব্যর্থ হয়েছে");

      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: "APPROVED" } : p))
      );
      setStatusMessage({ type: "success", text: data.message });
      setPaymentToApprove(null);
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectSubmit = async (paymentId: string) => {
    if (!rejectReason.trim()) {
      setStatusMessage({ type: "error", text: "অনুগ্রহ করে বাতিলের কারণ লিখুন" });
      return;
    }
    setLoadingId(paymentId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "বাতিল ব্যর্থ হয়েছে");

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? { ...p, status: "REJECTED", rejectionReason: rejectReason }
            : p
        )
      );
      setStatusMessage({ type: "success", text: data.message });
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenRevert = (p: MockPayment) => {
    setPaymentToRevert(p);
    setRevertTargetStatus("SUBMITTED");
    setRevertReason("ভুলবশত অনুমোদন করা হয়েছিল");
  };

  const handleConfirmRevert = async () => {
    if (!paymentToRevert) return;
    setIsReverting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/payments/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentToRevert.id,
          targetStatus: revertTargetStatus,
          reason: revertReason.trim() || "ভুলবশত অনুমোদন করা হয়েছিল",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "অনুমোদন রিভার্স ব্যর্থ হয়েছে");

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentToRevert.id
            ? {
                ...p,
                status: revertTargetStatus,
                rejectionReason:
                  revertTargetStatus === "REJECTED"
                    ? revertReason.trim() || "ভুলবশত অনুমোদন করা হয়েছিল"
                    : undefined,
              }
            : p
        )
      );
      setStatusMessage({ type: "success", text: data.message });
      setPaymentToRevert(null);
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsReverting(false);
    }
  };

  const handleOpenResolve = (p: MockPayment) => {
    setPaymentToResolve(p);
    setResolveTrxId(p.transactionId);
    setResolveSenderNumber(p.senderNumber);
  };

  const handleResolveSubmit = async (approveNow: boolean) => {
    if (!paymentToResolve) return;
    if (!resolveTrxId.trim() || resolveTrxId.trim().length < 8) {
      setStatusMessage({
        type: "error",
        text: "অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (কমপক্ষে ৮ অক্ষর) প্রদান করুন।",
      });
      return;
    }

    setIsResolving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/payments/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentToResolve.id,
          transactionId: resolveTrxId.trim().toUpperCase(),
          senderNumber: resolveSenderNumber.trim(),
          approveNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "সমাধান ব্যর্থ হয়েছে");

      const updatedPayment: MockPayment = data.data?.payment || {
        ...paymentToResolve,
        transactionId: resolveTrxId.trim().toUpperCase(),
        senderNumber: resolveSenderNumber.trim() || paymentToResolve.senderNumber,
        status: approveNow ? "APPROVED" : "SUBMITTED",
        rejectionReason: undefined,
      };

      setPayments((prev) =>
        prev.map((p) => (p.id === paymentToResolve.id ? { ...p, ...updatedPayment } : p))
      );
      setStatusMessage({ type: "success", text: data.message });
      setPaymentToResolve(null);
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsResolving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;
    const targetId = paymentToDelete.id;
    setIsDeleting(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/payments?id=${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "পেমেন্ট ডিলিট ব্যর্থ হয়েছে");
      }

      setPayments((prev) => prev.filter((p) => p.id !== targetId));
      if (rejectingId === targetId) {
        setRejectingId(null);
        setRejectReason("");
      }
      setStatusMessage({ type: "success", text: data.message });
      setPaymentToDelete(null);
      router.refresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
      setPaymentToDelete(null);
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
            placeholder="TrxID, ফোন নম্বর, অর্ডার নং বা মার্কেটার খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {["ALL", "SUBMITTED", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                filterStatus === st
                  ? "bg-[#172033] text-white border-[#172033]"
                  : "bg-white text-[#64748B] border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "ALL" && "সকল"}
              {st === "SUBMITTED" && "পেন্ডিং (রিভিউ)"}
              {st === "APPROVED" && "অনুমোদিত"}
              {st === "REJECTED" && "বাতিলকৃত"}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse text-xs min-w-[780px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">অর্ডার নং</th>
                <th className="py-3.5 px-4">শিক্ষার্থীর নাম</th>
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">মার্কেটার (রেফারার)</th>
                <th className="py-3.5 px-4">bKash নম্বর</th>
                <th className="py-3.5 px-4">TrxID</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isSubmitted = p.status === "SUBMITTED";
                  const isApproved = p.status === "APPROVED";
                  const isRejecting = rejectingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                        {p.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{p.customerName}</td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate">{p.courseTitleBn}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#E53945]">
                        {formatBDT(p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.marketerName || p.marketerCode ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-[#172033]">
                              <UserCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              <span className="truncate max-w-[130px]">
                                {p.marketerName || "অ্যাফিলিয়েট মার্কেটার"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.marketerCode && (
                                <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  {p.marketerCode}
                                </span>
                              )}
                              {p.commissionAmount ? (
                                <span className="text-[10px] text-[#16A34A] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  +{formatBDT(p.commissionAmount)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium inline-block">
                            সরাসরি (অরগ্যানিক)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{p.senderNumber}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block my-2">
                        {p.transactionId}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === "SUBMITTED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" />
                            যাচাই অপেক্ষমান
                          </span>
                        )}
                        {p.status === "APPROVED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            অনুমোদিত (PAID)
                          </span>
                        )}
                        {p.status === "REJECTED" && (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                              <X className="w-3 h-3" />
                              বাতিলকৃত
                            </span>
                            {p.rejectionReason && (
                              <p className="text-[10px] text-rose-600 max-w-[160px] truncate" title={p.rejectionReason}>
                                {p.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSubmitted ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setPaymentToApprove(p)}
                                disabled={loadingId === p.id}
                                className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{loadingId === p.id ? "..." : "Approve"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(isRejecting ? null : p.id);
                                  setRejectReason("");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-[#E53945] font-bold text-xs transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRevert(p)}
                              title="ভুলবশত অনুমোদিত হলে বাতিল/রিভার্স করুন"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>রিভার্স / বাতিল</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenResolve(p)}
                              title="সঠিক TrxID আপডেট করে অনুমোদন করুন"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>সমাধান ও অনুমোদন</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setPaymentToDelete(p)}
                            title="পেমেন্ট রেকর্ড ডিলিট করুন"
                            aria-label={`পেমেন্ট ${p.orderNumber} ডিলিট করুন`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Rejection Prompt Inline */}
                        {isRejecting && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-left space-y-1.5">
                            <label className="text-[10px] font-bold text-red-800">বাতিলের কারণ:</label>
                            <input
                              type="text"
                              placeholder="ভুল TrxID বা টাকা পাওয়া যায়নি..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-red-300 rounded text-xs focus:outline-none"
                            />
                            <div className="flex justify-end gap-1 pt-1">
                              <button
                                type="button"
                                onClick={() => setRejectingId(null)}
                                className="px-2 py-0.5 text-[10px] text-slate-600 hover:underline cursor-pointer"
                              >
                                ক্যানসেল
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectSubmit(p.id)}
                                className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                              >
                                নিশ্চিত করুন
                              </button>
                            </div>
                          </div>
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

      {/* APPROVE CONFIRMATION MODAL */}
      {paymentToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !loadingId && setPaymentToApprove(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  পেমেন্ট অনুমোদন নিশ্চিত করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  অনুমোদন করলে শিক্ষার্থী স্বয়ংক্রিয়ভাবে কোর্স অ্যাক্সেস পাবে এবং মার্কেটার কমিশন যুক্ত হবে।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার নং:</span>
                <span className="font-mono font-bold text-blue-600">{paymentToApprove.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">শিক্ষার্থী:</span>
                <span className="font-bold text-slate-800">{paymentToApprove.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TrxID / প্রেরক:</span>
                <span className="font-mono font-bold text-slate-900">
                  {paymentToApprove.transactionId} ({paymentToApprove.senderNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পরিমাণ:</span>
                <span className="font-black text-[#E53945]">{formatBDT(paymentToApprove.amount)}</span>
              </div>
              {paymentToApprove.commissionAmount ? (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">মার্কেটার কমিশন:</span>
                  <span className="font-bold text-emerald-700">
                    {formatBDT(paymentToApprove.commissionAmount)} ({paymentToApprove.marketerCode})
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(loadingId)}
                onClick={() => setPaymentToApprove(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={Boolean(loadingId)}
                onClick={handleConfirmApprove}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
              >
                {loadingId === paymentToApprove.id && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>হ্যাঁ, অনুমোদন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVERT MISTAKEN APPROVAL MODAL */}
      {paymentToRevert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isReverting && setPaymentToRevert(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  ভুল অনুমোদন রিভার্স / বাতিল করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  অর্ডার <strong className="text-slate-800">{paymentToRevert.orderNumber}</strong>{" "}
                  (TrxID: <span className="font-mono font-bold">{paymentToRevert.transactionId}</span>) এর অনুমোদন বাতিল করলে শিক্ষার্থীর কোর্স অ্যাক্সেস প্রত্যাহার এবং যুক্ত হওয়া অ্যাফিলিয়েট কমিশন রিভার্স হয়ে যাবে।
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  রিভার্স করার পর পেমেন্ট স্ট্যাটাস কী হবে?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRevertTargetStatus("SUBMITTED")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      revertTargetStatus === "SUBMITTED"
                        ? "border-amber-500 bg-amber-50/70 text-amber-900"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold">পেন্ডিং রিভিউতে ফেরত পাঠান</p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      আবার যাচাই করে Approve বা Reject করতে পারবেন
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRevertTargetStatus("REJECTED")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      revertTargetStatus === "REJECTED"
                        ? "border-rose-500 bg-rose-50/70 text-rose-900"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold">সরাসরি বাতিল (Reject) করুন</p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      পেমেন্ট অবৈধ হিসেবে বাতিল হবে
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">কারণ (Reason)</label>
                <input
                  type="text"
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  placeholder="ভুলবশত অনুমোদন করা হয়েছিল..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isReverting}
                onClick={() => setPaymentToRevert(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                disabled={isReverting}
                onClick={handleConfirmRevert}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-60"
              >
                {isReverting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>নিশ্চিতভাবে রিভার্স করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RESOLVE REJECTED PAYMENT MODAL */}
      {paymentToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isResolving && setPaymentToResolve(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  বাতিলকৃত পেমেন্ট সমাধান ও অনুমোদন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  শিক্ষার্থী সঠিক TrxID দিলে এখানে তা আপডেট করে সরাসরি পেমেন্ট অনুমোদন করতে পারবেন অথবা পেন্ডিং রিভিউতে পাঠাতে পারবেন।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার ও শিক্ষার্থী:</span>
                <span className="font-bold text-slate-800">
                  {paymentToResolve.orderNumber} • {paymentToResolve.customerName}
                </span>
              </div>
              {paymentToResolve.rejectionReason && (
                <div className="flex justify-between">
                  <span className="text-slate-500">পূর্বের বাতিলের কারণ:</span>
                  <span className="font-semibold text-rose-600">{paymentToResolve.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  সঠিক TrxID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={resolveTrxId}
                  onChange={(e) => setResolveTrxId(e.target.value.toUpperCase())}
                  placeholder="যেমন: BKASH992821"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono uppercase font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">প্রেরকের bKash নম্বর</label>
                <input
                  type="text"
                  value={resolveSenderNumber}
                  onChange={(e) => setResolveSenderNumber(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isResolving}
                onClick={() => setPaymentToResolve(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={() => handleResolveSubmit(false)}
                className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                পেন্ডিং রিভিউতে রাখুন
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={() => handleResolveSubmit(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
              >
                {isResolving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>সমাধান ও অনুমোদন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setPaymentToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  পেমেন্ট রেকর্ড ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে অর্ডার{" "}
                  <strong className="text-slate-800">{paymentToDelete.orderNumber}</strong> এর পেমেন্ট
                  (TrxID:{" "}
                  <span className="font-mono font-bold text-slate-800">
                    {paymentToDelete.transactionId}
                  </span>{" "}
                  • {formatBDT(paymentToDelete.amount)} • {paymentToDelete.customerName}) তালিকা থেকে মুছে ফেলতে চান?
                </p>
                {paymentToDelete.status === "APPROVED" && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 font-medium">
                    নোট: অনুমোদিত পেমেন্ট ডিলিট করলে শিক্ষার্থীর কোর্স অ্যাক্সেস প্রত্যাহার এবং যুক্ত হওয়া অ্যাফিলিয়েট কমিশন রিভার্স হয়ে যাবে।
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPaymentToDelete(null)}
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
