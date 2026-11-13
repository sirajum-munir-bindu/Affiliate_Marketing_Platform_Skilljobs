"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MockPayout } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  X,
  Loader2
} from "lucide-react";

interface Props {
  currentBalance: number;
  pendingBalance?: number;
  paidEarnings?: number;
  payoutAccountNo?: string;
  initialPayouts: MockPayout[];
}

export function PayoutRequestClient({
  currentBalance,
  pendingBalance = 0,
  paidEarnings = 0,
  payoutAccountNo = "",
  initialPayouts,
}: Props) {
  const router = useRouter();
  const [balance, setBalance] = useState(currentBalance);
  const [pending, setPending] = useState(pendingBalance);
  const [payouts, setPayouts] = useState<MockPayout[]>(initialPayouts);
  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<"BKASH" | "NAGAD" | "BANK_TRANSFER">("BKASH");
  const [accountNo, setAccountNo] = useState(payoutAccountNo);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/affiliate/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          destinationNumber: accountNo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "উত্তোলন আবেদন ব্যর্থ হয়েছে");

      setPayouts([data.payout, ...payouts]);
      setBalance((prev) => prev - Number(amount));
      setPending((prev) => prev + Number(amount));
      setMsg({ type: "success", text: data.message });
      router.refresh();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
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

      {/* Payout Request Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Executive Dark Balance Card (4 cols) */}
        <div className="lg:col-span-4 relative overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#111C35] to-[#0B1120] border border-slate-800 text-white rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              উত্তোলনযোগ্য ব্যালেন্স
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              {formatBDT(balance)}
            </div>
            <p className="text-[11px] text-slate-400">
              ন্যূনতম উত্তোলনের পরিমাণ: <strong className="text-white">৳৫০০</strong>
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-400">প্রক্রিয়াধীন</p>
              <p className="font-black text-amber-300 mt-0.5">{formatBDT(pending)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-[10px] text-slate-400">মোট উত্তোলিত</p>
              <p className="font-black text-white mt-0.5">{formatBDT(paidEarnings)}</p>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 space-y-1">
            <p>✓ আবেদন করার পর এডমিন ভেরিফাই করে আপনার একাউন্টে টাকা পাঠিয়ে দেন।</p>
            <p>✓ কোনো অতিরিক্ত ফি বা চার্জ কাটা হয় না।</p>
          </div>
        </div>

        {/* Request Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#172033]">
                টাকা উত্তোলনের রিকোয়েস্ট পাঠান
              </h3>
              <p className="text-xs text-slate-500">
                সঠিক পেমেন্ট মাধ্যম ও একাউন্ট নম্বর প্রদান করুন
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#172033]">
                  উত্তোলনের পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  min="500"
                  max={balance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-black text-emerald-700 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#172033]">
                  পেমেন্ট মাধ্যম
                </label>
                <select
                  value={method}
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="BKASH">bKash (বিকাশ)</option>
                  <option value="NAGAD">Nagad (নগদ)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (ব্যাংক)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172033]">
                bKash / একাউন্ট নম্বর
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: 01712345678"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-mono focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || balance < 500 || amount > balance || amount < 500}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#E53945] to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-xs shadow-lg shadow-red-500/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? "আবেদন পাঠানো হচ্ছে..." : "উত্তোলন নিশ্চিত করুন"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 font-black text-sm text-[#172033] flex items-center justify-between">
          <span>পে-আউট হিস্ট্রি</span>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {payouts.length} টি লেনদেন
          </span>
        </div>
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">আইডি</th>
                <th className="py-3.5 px-4">পরিমাণ</th>
                <th className="py-3.5 px-4">মাধ্যম</th>
                <th className="py-3.5 px-4">অ্যাকাউন্ট নং</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4">রেফারেন্স / নোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    কোনো পে-আউট আবেদন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                      {p.payoutNumber}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#16A34A]">
                      {formatBDT(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{p.method}</td>
                    <td className="py-3.5 px-4 font-mono">{p.destinationNumber}</td>
                    <td className="py-3.5 px-4">
                      {p.status === "PAID" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> পরিশোধিত (PAID)
                        </span>
                      ) : p.status === "REJECTED" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                          <X className="w-3 h-3" /> বাতিলকৃত
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> যাচাই অপেক্ষমান
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {p.transactionReference || p.adminNotes || "—"}
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
