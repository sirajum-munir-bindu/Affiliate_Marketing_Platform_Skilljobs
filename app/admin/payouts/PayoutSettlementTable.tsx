"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MockPayout } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import {
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  Trash2,
  Loader2,
  ShieldAlert
} from "lucide-react";

interface Props {
  initialPayouts: MockPayout[];
}

export function PayoutSettlementTable({ initialPayouts }: Props) {
  const router = useRouter();
  const [payouts, setPayouts] = useState<MockPayout[]>(initialPayouts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Approve modal
  const [payoutToApprove, setPayoutToApprove] = useState<MockPayout | null>(null);
  const [approveRef, setApproveRef] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Inline reject
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Revert modal
  const [payoutToRevert, setPayoutToRevert] = useState<MockPayout | null>(null);
  const [revertTargetStatus, setRevertTargetStatus] = useState<"REQUESTED" | "REJECTED">("REQUESTED");
  const [revertReason, setRevertReason] = useState("ভুলবশত অনুমোদন করা হয়েছিল");
  const [isReverting, setIsReverting] = useState(false);

  // Resolve rejected modal
  const [payoutToResolve, setPayoutToResolve] = useState<MockPayout | null>(null);
  const [resolveDestNumber, setResolveDestNumber] = useState("");
  const [resolveRef, setResolveRef] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Delete modal
  const [payoutToDelete, setPayoutToDelete] = useState<MockPayout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPayouts = payouts.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.payoutNumber.toLowerCase().includes(q) ||
      p.marketerName.toLowerCase().includes(q) ||
      p.destinationNumber.toLowerCase().includes(q) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(q));

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && p.status === filterStatus;
  });

  const handleOpenApprove = (p: MockPayout) => {
    setPayoutToApprove(p);
    setApproveRef("");
  };

  const handleConfirmApprove = async () => {
    if (!payoutToApprove) return;
    if (!approveRef.trim()) {
      setMsg({
        type: "error",
        text: "অনুগ্রহ করে bKash বা ব্যাংক ট্রানজেকশন রেফারেন্স প্রদান করুন",
      });
      return;
    }

    setIsApproving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payoutToApprove.id,
          action: "APPROVE",
          reference: approveRef.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "নিষ্পত্তি ব্যর্থ হয়েছে");

      setPayouts((prev) =>
        prev.map((p) => (p.id === payoutToApprove.id ? data.payout : p))
      );
      setMsg({ type: "success", text: data.message });
      setPayoutToApprove(null);
      setApproveRef("");
      router.refresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSubmit = async (payoutId: string) => {
    if (!rejectReason.trim()) {
      setMsg({ type: "error", text: "অনুগ্রহ করে বাতিলের কারণ লিখুন" });
      return;
    }
    setIsRejecting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          action: "REJECT",
          reason: rejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "বাতিল ব্যর্থ হয়েছে");

      setPayouts((prev) =>
        prev.map((p) => (p.id === payoutId ? data.payout : p))
      );
      setMsg({ type: "success", text: data.message });
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleOpenRevert = (p: MockPayout) => {
    setPayoutToRevert(p);
    setRevertTargetStatus("REQUESTED");
    setRevertReason("ভুলবশত অনুমোদন করা হয়েছিল");
  };

  const handleConfirmRevert = async () => {
    if (!payoutToRevert) return;
    setIsReverting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payoutToRevert.id,
          action: "REVERT",
          targetStatus: revertTargetStatus,
          reason: revertReason.trim() || "ভুলবশত অনুমোদন করা হয়েছিল",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "রিভার্স ব্যর্থ হয়েছে");

      setPayouts((prev) =>
        prev.map((p) => (p.id === payoutToRevert.id ? data.payout : p))
      );
      setMsg({ type: "success", text: data.message });
      setPayoutToRevert(null);
      router.refresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setIsReverting(false);
    }
  };

  const handleOpenResolve = (p: MockPayout) => {
    setPayoutToResolve(p);
    setResolveDestNumber(p.destinationNumber || "");
    setResolveRef(p.transactionReference || "");
  };

  const handleResolveSubmit = async (approveNow: boolean) => {
    if (!payoutToResolve) return;
    if (approveNow && !resolveRef.trim()) {
      setMsg({
        type: "error",
        text: "অনুমোদন করতে bKash/Bank ট্রানজেকশন রেফারেন্স প্রদান করুন।",
      });
      return;
    }

    setIsResolving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: payoutToResolve.id,
          action: "RESOLVE",
          destinationNumber: resolveDestNumber.trim(),
          reference: resolveRef.trim(),
          approveNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "সমাধান ব্যর্থ হয়েছে");

      setPayouts((prev) =>
        prev.map((p) => (p.id === payoutToResolve.id ? data.payout : p))
      );
      setMsg({ type: "success", text: data.message });
      setPayoutToResolve(null);
      router.refresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setIsResolving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!payoutToDelete) return;
    setIsDeleting(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/payouts?id=${payoutToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "ডিলিট ব্যর্থ হয়েছে");

      setPayouts((prev) => prev.filter((p) => p.id !== payoutToDelete.id));
      setMsg({ type: "success", text: data.message });
      setPayoutToDelete(null);
      router.refresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
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
            placeholder="পে-আউট আইডি, মার্কেটার, নম্বর বা রেফারেন্স খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {["ALL", "REQUESTED", "PAID", "REJECTED"].map((st) => (
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
              {st === "REQUESTED" && "অপেক্ষমান"}
              {st === "PAID" && "পরিশোধিত (PAID)"}
              {st === "REJECTED" && "বাতিলকৃত"}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">পে-আউট আইডি</th>
                <th className="py-3.5 px-4">মার্কেটার</th>
                <th className="py-3.5 px-4">উত্তোলনের পরিমাণ</th>
                <th className="py-3.5 px-4">পদ্ধতি</th>
                <th className="py-3.5 px-4">অ্যাকাউন্ট নং</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">নিষ্পত্তি অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো পে-আউট রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => {
                  const isRequested = p.status === "REQUESTED";
                  const isPaid = p.status === "PAID";
                  const isRejectingRow = rejectingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                        {p.payoutNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold">{p.marketerName}</td>
                      <td className="py-3.5 px-4 font-black text-[#16A34A]">
                        {formatBDT(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold">{p.method}</td>
                      <td className="py-3.5 px-4 font-mono">{p.destinationNumber}</td>
                      <td className="py-3.5 px-4">
                        {p.status === "REQUESTED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> অপেক্ষা করছে
                          </span>
                        )}
                        {p.status === "PAID" && (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> পরিশোধিত (PAID)
                            </span>
                            {p.transactionReference && (
                              <p className="text-[10px] font-mono text-slate-500">
                                Ref: {p.transactionReference}
                              </p>
                            )}
                          </div>
                        )}
                        {p.status === "REJECTED" && (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                              <X className="w-3 h-3" /> বাতিলকৃত
                            </span>
                            {p.adminNotes && (
                              <p
                                className="text-[10px] text-rose-600 max-w-[160px] truncate"
                                title={p.adminNotes}
                              >
                                {p.adminNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRequested ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenApprove(p)}
                                className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(isRejectingRow ? null : p.id);
                                  setRejectReason("");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-[#E53945] font-bold text-xs transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : isPaid ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRevert(p)}
                              title="ভুলবশত অনুমোদিত হলে রিভার্স/বাতিল করুন"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>রিভার্স / বাতিল</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenResolve(p)}
                              title="তথ্য সমাধান করে অনুমোদন করুন"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>সমাধান ও অনুমোদন</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setPayoutToDelete(p)}
                            title="পে-আউট রেকর্ড ডিলিট করুন"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isRejectingRow && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-left space-y-1.5">
                            <label className="text-[10px] font-bold text-red-800">বাতিলের কারণ:</label>
                            <input
                              type="text"
                              placeholder="ভুল নম্বর বা অন্যান্য কারণ..."
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
                                disabled={isRejecting}
                                onClick={() => handleRejectSubmit(p.id)}
                                className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer disabled:opacity-60"
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

      {/* APPROVE PAYOUT MODAL */}
      {payoutToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isApproving && setPayoutToApprove(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  পে-আউট অনুমোদন ও নিষ্পত্তি নিশ্চিত করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  পেমেন্ট পাঠানোর পর ট্রানজেকশন রেফারেন্স দিয়ে পে-আউটটি পরিশোধিত (PAID) হিসেবে চিহ্নিত করুন।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">পে-আউট আইডি:</span>
                <span className="font-mono font-bold text-blue-600">{payoutToApprove.payoutNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মার্কেটার:</span>
                <span className="font-bold text-slate-800">{payoutToApprove.marketerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পদ্ধতি ও নম্বর:</span>
                <span className="font-mono font-bold text-slate-900">
                  {payoutToApprove.method} ({payoutToApprove.destinationNumber})
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">পরিমাণ:</span>
                <span className="font-black text-[#16A34A]">{formatBDT(payoutToApprove.amount)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">
                bKash / Bank ট্রানজেকশন রেফারেন্স <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={approveRef}
                onChange={(e) => setApproveRef(e.target.value)}
                placeholder="যেমন: BKASH-TRX-7890123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isApproving}
                onClick={() => setPayoutToApprove(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={handleConfirmApprove}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
              >
                {isApproving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>হ্যাঁ, অনুমোদন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVERT MISTAKEN PAYOUT APPROVAL MODAL */}
      {payoutToRevert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isReverting && setPayoutToRevert(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  ভুল পে-আউট অনুমোদন রিভার্স / বাতিল করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  পে-আউট <strong className="text-slate-800">{payoutToRevert.payoutNumber}</strong> (
                  {formatBDT(payoutToRevert.amount)}) রিভার্স করলে মার্কেটারের পেইড আর্নিং ও ব্যালেন্স স্বয়ংক্রিয়ভাবে সমন্বয় হবে।
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  রিভার্স করার পর পে-আউট স্ট্যাটাস কী হবে?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRevertTargetStatus("REQUESTED")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      revertTargetStatus === "REQUESTED"
                        ? "border-amber-500 bg-amber-50/70 text-amber-900"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold">অপেক্ষমাণ তালিকায় ফেরত পাঠান</p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      ব্যালেন্স পেন্ডিংয়ে থাকবে এবং পুনরায় যাচাই করা যাবে
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
                      টাকা মার্কেটারের মূল ব্যালেন্সে ফেরত যাবে
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
                onClick={() => setPayoutToRevert(null)}
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

      {/* RESOLVE REJECTED PAYOUT MODAL */}
      {payoutToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isResolving && setPayoutToResolve(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  বাতিলকৃত পে-আউট সমাধান ও অনুমোদন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  অ্যাকাউন্ট নম্বর আপডেট করে অপেক্ষমাণ তালিকায় ফেরত পাঠান অথবা রেফারেন্স দিয়ে সরাসরি পরিশোধিত (PAID) হিসেবে অনুমোদন করুন।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">পে-আউট ও মার্কেটার:</span>
                <span className="font-bold text-slate-800">
                  {payoutToResolve.payoutNumber} • {payoutToResolve.marketerName} ({formatBDT(payoutToResolve.amount)})
                </span>
              </div>
              {payoutToResolve.adminNotes && (
                <div className="flex justify-between">
                  <span className="text-slate-500">পূর্বের বাতিলের কারণ:</span>
                  <span className="font-semibold text-rose-600">{payoutToResolve.adminNotes}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">সঠিক অ্যাকাউন্ট নম্বর</label>
                <input
                  type="text"
                  value={resolveDestNumber}
                  onChange={(e) => setResolveDestNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  bKash / Bank ট্রানজেকশন রেফারেন্স (সরাসরি অনুমোদনের জন্য আবশ্যক)
                </label>
                <input
                  type="text"
                  value={resolveRef}
                  onChange={(e) => setResolveRef(e.target.value)}
                  placeholder="যেমন: BKASH-TRX-7890123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isResolving}
                onClick={() => setPayoutToResolve(null)}
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
                অপেক্ষমাণ তালিকায় রাখুন
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
      {payoutToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setPayoutToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  পে-আউট রেকর্ড ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে পে-আউট{" "}
                  <strong className="text-slate-800">{payoutToDelete.payoutNumber}</strong> (
                  {formatBDT(payoutToDelete.amount)} • {payoutToDelete.marketerName}) তালিকা থেকে মুছে ফেলতে চান?
                </p>
                {payoutToDelete.status !== "REJECTED" && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 font-medium">
                    নোট: ডিলিট করলে {formatBDT(payoutToDelete.amount)} মার্কেটারের বর্তমান ব্যালেন্সে সমন্বয় করা হবে।
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPayoutToDelete(null)}
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
