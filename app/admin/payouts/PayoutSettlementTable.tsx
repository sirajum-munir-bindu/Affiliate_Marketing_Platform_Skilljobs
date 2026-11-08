"use client";

import { useState } from "react";
import { MockPayout } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { Check, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Props {
  initialPayouts: MockPayout[];
}

export function PayoutSettlementTable({ initialPayouts }: Props) {
  const [payouts, setPayouts] = useState<MockPayout[]>(initialPayouts);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSettle = async (payoutId: string) => {
    if (!reference.trim()) {
      alert("অনুগ্রহ করে bKash বা ব্যাংক ট্রানজেকশন রেফারেন্স প্রদান করুন");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/payouts/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "নিষ্পত্তি ব্যর্থ হয়েছে");

      setPayouts((prev) =>
        prev.map((p) =>
          p.id === payoutId
            ? { ...p, status: "PAID", transactionReference: reference, processedAt: new Date().toISOString() }
            : p
        )
      );
      setMsg({ type: "success", text: data.message });
      setSettlingId(null);
      setReference("");
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              {payouts.map((p) => {
                const isRequested = p.status === "REQUESTED";
                const isSettling = settlingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">{p.payoutNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{p.marketerName}</td>
                    <td className="py-3.5 px-4 font-black text-[#16A34A]">{formatBDT(p.amount)}</td>
                    <td className="py-3.5 px-4 font-bold">{p.method}</td>
                    <td className="py-3.5 px-4 font-mono">{p.destinationNumber}</td>
                    <td className="py-3.5 px-4">
                      {p.status === "REQUESTED" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> অপেক্ষা করছে
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> পরিশোধিত (PAID)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isRequested ? (
                        <div>
                          {!isSettling ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSettlingId(p.id);
                                setReference("");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                            >
                              পেমেন্ট নিশ্চিত করুন
                            </button>
                          ) : (
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-left">
                              <label className="text-[10px] font-bold text-slate-700">bKash/Bank TrxID:</label>
                              <input
                                type="text"
                                placeholder="রেফারেন্স নম্বর দিন"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                              />
                              <div className="flex justify-end gap-1 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSettlingId(null)}
                                  className="px-2 py-0.5 text-[10px] text-slate-600 hover:underline"
                                >
                                  ক্যানসেল
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => handleSettle(p.id)}
                                  className="px-2.5 py-0.5 bg-[#16A34A] text-white rounded text-[10px] font-bold"
                                >
                                  সম্পন্ন করুন
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-slate-600 block">
                            Ref: {p.transactionReference}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
