"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MockAffiliateApplication } from "@/lib/db/mock-data";
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
  initialApplications: MockAffiliateApplication[];
}

export function ApplicationsTable({ initialApplications }: Props) {
  const router = useRouter();
  const [apps, setApps] = useState<MockAffiliateApplication[]>(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Approve confirmation modal
  const [appToApprove, setAppToApprove] = useState<MockAffiliateApplication | null>(null);

  // Revert mistaken approval modal
  const [appToRevert, setAppToRevert] = useState<MockAffiliateApplication | null>(null);
  const [revertTargetStatus, setRevertTargetStatus] = useState<"PENDING" | "REJECTED">("PENDING");
  const [revertReason, setRevertReason] = useState("ভুলবশত অনুমোদন করা হয়েছিল");
  const [isReverting, setIsReverting] = useState(false);

  // Resolve rejected application modal
  const [appToResolve, setAppToResolve] = useState<MockAffiliateApplication | null>(null);
  const [resolveOccupation, setResolveOccupation] = useState("");
  const [resolveChannels, setResolveChannels] = useState("");
  const [resolveExperience, setResolveExperience] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Delete confirmation modal
  const [appToDelete, setAppToDelete] = useState<MockAffiliateApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredApps = apps.filter((a) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.occupation.toLowerCase().includes(q) ||
      a.channels.toLowerCase().includes(q);

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && a.status === filterStatus;
  });

  const handleConfirmApprove = async () => {
    if (!appToApprove) return;
    const applicationId = appToApprove.id;
    setLoadingId(applicationId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "অনুমোদন ব্যর্থ হয়েছে");

      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status: "APPROVED", rejectionReason: undefined }
            : a
        )
      );
      setMessage({ type: "success", text: data.message });
      setAppToApprove(null);
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectSubmit = async (applicationId: string) => {
    if (!rejectReason.trim()) {
      setMessage({ type: "error", text: "অনুগ্রহ করে বাতিলের কারণ লিখুন" });
      return;
    }
    setLoadingId(applicationId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          action: "REJECT",
          reason: rejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "বাতিল ব্যর্থ হয়েছে");

      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status: "REJECTED", rejectionReason: rejectReason.trim() }
            : a
        )
      );
      setMessage({ type: "success", text: data.message });
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenRevert = (app: MockAffiliateApplication) => {
    setAppToRevert(app);
    setRevertTargetStatus("PENDING");
    setRevertReason("ভুলবশত অনুমোদন করা হয়েছিল");
  };

  const handleConfirmRevert = async () => {
    if (!appToRevert) return;
    setIsReverting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appToRevert.id,
          action: "REVERT",
          targetStatus: revertTargetStatus,
          reason: revertReason.trim() || "ভুলবশত অনুমোদন করা হয়েছিল",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "রিভার্স ব্যর্থ হয়েছে");

      setApps((prev) =>
        prev.map((a) =>
          a.id === appToRevert.id
            ? {
                ...a,
                status: revertTargetStatus,
                rejectionReason:
                  revertTargetStatus === "REJECTED"
                    ? revertReason.trim() || "ভুলবশত অনুমোদন করা হয়েছিল"
                    : undefined,
              }
            : a
        )
      );
      setMessage({ type: "success", text: data.message });
      setAppToRevert(null);
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsReverting(false);
    }
  };

  const handleOpenResolve = (app: MockAffiliateApplication) => {
    setAppToResolve(app);
    setResolveOccupation(app.occupation || "");
    setResolveChannels(app.channels || "");
    setResolveExperience(app.marketingExperience || "");
  };

  const handleResolveSubmit = async (approveNow: boolean) => {
    if (!appToResolve) return;
    setIsResolving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appToResolve.id,
          action: "RESOLVE",
          occupation: resolveOccupation.trim(),
          channels: resolveChannels.trim(),
          marketingExperience: resolveExperience.trim(),
          approveNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "সমাধান ব্যর্থ হয়েছে");

      setApps((prev) =>
        prev.map((a) =>
          a.id === appToResolve.id
            ? {
                ...a,
                occupation: resolveOccupation.trim() || a.occupation,
                channels: resolveChannels.trim() || a.channels,
                marketingExperience: resolveExperience.trim() || a.marketingExperience,
                status: approveNow ? "APPROVED" : "PENDING",
                rejectionReason: undefined,
              }
            : a
        )
      );
      setMessage({ type: "success", text: data.message });
      setAppToResolve(null);
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsResolving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/applications?id=${appToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "ডিলিট ব্যর্থ হয়েছে");

      setApps((prev) => prev.filter((a) => a.id !== appToDelete.id));
      setMessage({ type: "success", text: data.message });
      setAppToDelete(null);
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
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
            placeholder="নাম, ইমেইল, ফোন, পেশা বা চ্যানেল খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
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
              {st === "PENDING" && "পেন্ডিং (রিভিউ)"}
              {st === "APPROVED" && "অনুমোদিত"}
              {st === "REJECTED" && "বাতিলকৃত"}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">আবেদনকারী</th>
                <th className="py-3.5 px-4">পেশা</th>
                <th className="py-3.5 px-4">প্রচার চ্যানেল</th>
                <th className="py-3.5 px-4">মার্কেটিং অভিজ্ঞতা</th>
                <th className="py-3.5 px-4">যোগদানের কারণ</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো আবেদন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isPending = app.status === "PENDING";
                  const isApproved = app.status === "APPROVED";
                  const isRejecting = rejectingId === app.id;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold">{app.fullName}</p>
                        <p className="text-[11px] text-slate-500">{app.email}</p>
                        <p className="text-[11px] font-mono text-slate-500">{app.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{app.occupation}</td>
                      <td className="py-3.5 px-4 max-w-[150px] truncate text-blue-600 font-medium">
                        {app.channels}
                      </td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate">{app.marketingExperience}</td>
                      <td className="py-3.5 px-4 max-w-[180px] truncate">{app.whyJoin}</td>
                      <td className="py-3.5 px-4">
                        {app.status === "PENDING" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> পেন্ডিং
                          </span>
                        )}
                        {app.status === "APPROVED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
                          </span>
                        )}
                        {app.status === "REJECTED" && (
                          <div className="space-y-1">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                              <X className="w-3 h-3" /> বাতিলকৃত
                            </span>
                            {app.rejectionReason && (
                              <p
                                className="text-[10px] text-rose-600 max-w-[160px] truncate"
                                title={app.rejectionReason}
                              >
                                {app.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setAppToApprove(app)}
                                disabled={loadingId === app.id}
                                className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{loadingId === app.id ? "..." : "Approve"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(isRejecting ? null : app.id);
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
                              onClick={() => handleOpenRevert(app)}
                              title="ভুলবশত অনুমোদিত হলে রিভার্স/বাতিল করুন"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>রিভার্স / বাতিল</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenResolve(app)}
                              title="তথ্য আপডেট করে অনুমোদন করুন"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>সমাধান ও অনুমোদন</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setAppToDelete(app)}
                            title="আবেদন ডিলিট করুন"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isRejecting && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200 text-left space-y-1.5">
                            <label className="text-[10px] font-bold text-red-800">বাতিলের কারণ:</label>
                            <input
                              type="text"
                              placeholder="কারণ লিখুন..."
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
                                onClick={() => handleRejectSubmit(app.id)}
                                className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                              >
                                বাতিল নিশ্চিত করুন
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
      {appToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !loadingId && setAppToApprove(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  অ্যাফিলিয়েট আবেদন অনুমোদন নিশ্চিত করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  অনুমোদন করলে আবেদনকারী অ্যাফিলিয়েট মার্কেটার হিসেবে যুক্ত হবেন এবং একটি ইউনিক রেফারেল কোড পাবেন।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">আবেদনকারী:</span>
                <span className="font-bold text-slate-800">{appToApprove.fullName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">ইমেইল ও ফোন:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {appToApprove.email} • {appToApprove.phone}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">পেশা:</span>
                <span className="font-semibold text-slate-800">{appToApprove.occupation}</span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-500 block">প্রচার চ্যানেল:</span>
                <span className="font-medium text-blue-600">{appToApprove.channels}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(loadingId)}
                onClick={() => setAppToApprove(null)}
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
                {loadingId === appToApprove.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>হ্যাঁ, অনুমোদন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVERT MISTAKEN APPROVAL MODAL */}
      {appToRevert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isReverting && setAppToRevert(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  ভুল অনুমোদন রিভার্স / বাতিল করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  <strong className="text-slate-800">{appToRevert.fullName}</strong> এর অ্যাফিলিয়েট অনুমোদন বাতিল করলে তার অ্যাফিলিয়েট অ্যাক্সেস প্রত্যাহার হবে।
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  রিভার্স করার পর আবেদনের স্ট্যাটাস কী হবে?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRevertTargetStatus("PENDING")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      revertTargetStatus === "PENDING"
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
                      আবেদনটি বাতিলকৃত হিসেবে চিহ্নিত হবে
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
                onClick={() => setAppToRevert(null)}
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

      {/* RESOLVE REJECTED APPLICATION MODAL */}
      {appToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isResolving && setAppToResolve(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  বাতিলকৃত আবেদন সমাধান ও অনুমোদন
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আবেদনকারীর সংশোধিত তথ্য আপডেট করে সরাসরি অনুমোদন করুন অথবা পেন্ডিং রিভিউতে পাঠান।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">আবেদনকারী:</span>
                <span className="font-bold text-slate-800">
                  {appToResolve.fullName} ({appToResolve.phone})
                </span>
              </div>
              {appToResolve.rejectionReason && (
                <div className="flex justify-between">
                  <span className="text-slate-500">পূর্বের বাতিলের কারণ:</span>
                  <span className="font-semibold text-rose-600">{appToResolve.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">পেশা</label>
                <input
                  type="text"
                  value={resolveOccupation}
                  onChange={(e) => setResolveOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">প্রচার চ্যানেল / লিংক</label>
                <input
                  type="text"
                  value={resolveChannels}
                  onChange={(e) => setResolveChannels(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">মার্কেটিং অভিজ্ঞতা</label>
                <textarea
                  rows={2}
                  value={resolveExperience}
                  onChange={(e) => setResolveExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden bg-slate-50/50 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isResolving}
                onClick={() => setAppToResolve(null)}
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
      {appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs"
            onClick={() => !isDeleting && setAppToDelete(null)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  আবেদনটি ডিলিট করতে চান?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিতভাবে{" "}
                  <strong className="text-slate-800">"{appToDelete.fullName}"</strong> এর
                  অ্যাফিলিয়েট আবেদনটি তালিকা থেকে মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setAppToDelete(null)}
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
