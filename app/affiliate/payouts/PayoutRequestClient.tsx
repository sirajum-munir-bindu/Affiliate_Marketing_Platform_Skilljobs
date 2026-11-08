"use client";

import { useState } from "react";
import { MockPayout } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { CreditCard, CheckCircle2, AlertCircle, Clock, Wallet } from "lucide-react";

interface Props {
  currentBalance: number;
  payoutAccountNo?: string;
  initialPayouts: MockPayout[];
}

export function PayoutRequestClient({
  currentBalance,
  payoutAccountNo = "",
  initialPayouts,
}: Props) {
  const [balance, setBalance] = useState(currentBalance);
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
      setMsg({ type: "success", text: data.message });
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

      {/* Payout Request Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Balance Card (4 cols) */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#172033] to-[#1E293B] text-white rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              উত্তোলনযোগ্য ব্যালেন্স
            </span>
            <div className="text-3xl font-black text-emerald-400">
              {formatBDT(balance)}
            </div>
            <p className="text-[11px] text-slate-400">
              ন্যূনতম উত্তোলনের পরিমাণ: <strong>৳৫০০</strong>
            </p>
          </div>

          <div className="text-[11px] text-slate-400 pt-4 border-t border-white/10 space-y-1">
            <p>✓ আবেদন করার পর এডমিন ভেরিফাই করে আপনার bKash নম্বরে টাকা পাঠিয়ে দেন।</p>
            <p>✓ কোনো অতিরিক্ত ফি বা চার্জ কাটা হয় না।</p>
          </div>
        </div>

        {/* Request Form (8 cols) */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
          <h3 className="font-bold text-base text-[#172033] mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#2563EB]" />
            <span>টাকা উত্তোলনের রিকোয়েস্ট পাঠান</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  উত্তোলনের পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  min="500"
                  max={balance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  পেমেন্ট মাধ্যম
                </label>
                <select
                  value={method}
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="BKASH">bKash (বিকাশ)</option>
                  <option value="NAGAD">Nagad (নগদ)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (ব্যাংক)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                bKash / একাউন্ট নম্বর
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: 01712345678"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || balance < 500 || amount > balance}
              className="py-3 px-6 rounded-xl bg-[#16A34A] hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all"
            >
              {isLoading ? "আবেদন পাঠানো হচ্ছে..." : "উত্তোলন নিশ্চিত করুন"}
            </button>
          </form>
        </div>

      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-[#172033]">
          পে-আউট হিস্ট্রি
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold text-[11px]">
                <th className="py-3 px-4">আইডি</th>
                <th className="py-3 px-4">পরিমাণ</th>
                <th className="py-3 px-4">মাধ্যম</th>
                <th className="py-3 px-4">অ্যাকাউন্ট নং</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4">রেফারেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{p.payoutNumber}</td>
                  <td className="py-3 px-4 font-black text-[#16A34A]">{formatBDT(p.amount)}</td>
                  <td className="py-3 px-4 font-bold">{p.method}</td>
                  <td className="py-3 px-4 font-mono">{p.destinationNumber}</td>
                  <td className="py-3 px-4">
                    {p.status === "PAID" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                        পরিশোধিত (PAID)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        যাচাই অপেক্ষমান
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {p.transactionReference || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
