"use client";

import { useState } from "react";
import { MockAffiliateApplication } from "@/lib/db/mock-data";
import { Check, X, Users, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Props {
  initialApplications: MockAffiliateApplication[];
}

export function ApplicationsTable({ initialApplications }: Props) {
  const [apps, setApps] = useState<MockAffiliateApplication[]>(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAction = async (applicationId: string, action: "APPROVE" | "REJECT", reason?: string) => {
    setLoadingId(applicationId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "অ্যাকশন ব্যর্থ হয়েছে");

      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status: action === "APPROVE" ? "APPROVED" : "REJECTED", rejectionReason: reason }
            : a
        )
      );
      setMessage({ type: "success", text: data.message });
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
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
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো আবেদন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                apps.map((app) => {
                  const isPending = app.status === "PENDING";
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
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                            <X className="w-3 h-3" /> বাতিলকৃত
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAction(app.id, "APPROVE")}
                              disabled={loadingId === app.id}
                              className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>অনুমোদন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(isRejecting ? null : app.id);
                                setRejectReason("");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-[#E53945] font-bold text-xs transition-colors"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">প্রসেসড</span>
                        )}

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
                                className="px-2 py-0.5 text-[10px] text-slate-600 hover:underline"
                              >
                                ক্যানসেল
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(app.id, "REJECT", rejectReason)}
                                className="px-2.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700"
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
    </div>
  );
}
