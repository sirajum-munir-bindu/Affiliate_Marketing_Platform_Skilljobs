"use client";

import { useState } from "react";
import { MockPayment } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { Check, X, AlertCircle, ShieldCheck, Clock, CheckCircle2, Search, Filter, UserCheck } from "lucide-react";

interface Props {
  initialPayments: MockPayment[];
}

export function PaymentVerificationTable({ initialPayments }: Props) {
  const [payments, setPayments] = useState<MockPayment[]>(initialPayments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

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

  const handleApprove = async (paymentId: string) => {
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
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectSubmit = async (paymentId: string) => {
    if (!rejectReason.trim()) {
      alert("অনুগ্রহ করে বাতিলের কারণ লিখুন");
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
        prev.map((p) => (p.id === paymentId ? { ...p, status: "REJECTED", rejectionReason: rejectReason } : p))
      );
      setStatusMessage({ type: "success", text: data.message });
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "SUBMITTED", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
                              <span className="truncate max-w-[130px]">{p.marketerName || "অ্যাফিলিয়েট মার্কেটার"}</span>
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
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                            <X className="w-3 h-3" />
                            বাতিলকৃত
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSubmitted ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(p.id)}
                              disabled={loadingId === p.id}
                              className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
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
                              className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-[#E53945] font-bold text-xs transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">সম্পন্ন</span>
                        )}

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
                                className="px-2 py-0.5 text-[10px] text-slate-600 hover:underline"
                              >
                                ক্যানসেল
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectSubmit(p.id)}
                                className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
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

    </div>
  );
}
