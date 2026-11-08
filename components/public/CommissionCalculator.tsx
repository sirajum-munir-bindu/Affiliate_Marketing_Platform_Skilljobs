"use client";

import { useState } from "react";
import { Calculator, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";

export function CommissionCalculator() {
  const [coursePrice, setCoursePrice] = useState<number>(3000);
  const [salesCount, setSalesCount] = useState<number>(15);
  const [commissionRate, setCommissionRate] = useState<number>(25);

  const totalSalesVolume = coursePrice * salesCount;
  const estimatedCommission = (totalSalesVolume * commissionRate) / 100;

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4" />
            ইনকাম স্টিমেটর
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            ইন্টারেক্টিভ কমিশন ক্যালকুলেটর
          </h2>
          <p className="mt-3 text-base text-[#475569]">
            নির্ধারণ করুন আপনি কত সেল করতে পারবেন এবং সহজেই দেখে নিন সম্ভাব্য আয়ের পরিমাণ।
          </p>
        </div>

        {/* Calculator Body */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Controls Column (7 cols) */}
          <div className="p-8 md:p-10 md:col-span-7 space-y-8">
            
            {/* Control 1: Course Average Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#172033]">
                  কোর্সের গড় মূল্য (৳)
                </label>
                <span className="text-base font-extrabold text-[#2563EB]">
                  {formatBDT(coursePrice)}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="500"
                value={coursePrice}
                onChange={(e) => setCoursePrice(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>৳১,০০০</span>
                <span>৳৪,০০০</span>
                <span>৳৮,০০০</span>
              </div>
            </div>

            {/* Control 2: Monthly Sales */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#172033]">
                  সম্ভাব্য মাসিক সফল সেল সংখ্যা
                </label>
                <span className="text-base font-extrabold text-[#E53945]">
                  {formatBnNumber(salesCount)} টি সেল
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={salesCount}
                onChange={(e) => setSalesCount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E53945]"
              />
              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>১ টি</span>
                <span>৫০ টি</span>
                <span>১০০ টি</span>
              </div>
            </div>

            {/* Control 3: Commission Percentage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#172033]">
                  কমিশন হার (%)
                </label>
                <span className="text-base font-extrabold text-[#16A34A]">
                  {commissionRate}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[20, 25, 30].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCommissionRate(rate)}
                    className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                      commissionRate === rate
                        ? "bg-[#16A34A] text-white border-[#16A34A] shadow-sm"
                        : "bg-slate-50 text-[#475569] border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {rate}% কমিশন
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Result Card Column (5 cols) */}
          <div className="bg-gradient-to-br from-[#172033] to-[#1E293B] text-white p-8 md:p-10 md:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Calculator className="w-4 h-4 text-[#2563EB]" />
                <span>সম্ভাব্য মাসিক আয়</span>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-black text-[#10B981] tracking-tight">
                  {formatBDT(estimatedCommission)}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  মোট কোর্স সেলস ভলিউম: <strong className="text-slate-200">{formatBDT(totalSalesVolume)}</strong>
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 space-y-2 border border-white/10">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>প্রতি সেলে আয়:</span>
                  <span className="font-bold text-white">
                    {formatBDT((coursePrice * commissionRate) / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>পে-আউট মাধ্যম:</span>
                  <span className="font-bold text-emerald-400">bKash / Bank</span>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-white/10">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                * এই হিসেবটি আনুমানিক অনুমানের জন্য। প্রকৃত উপার্জন আপনার সঠিক সেল সংখ্যা ও সংশ্লিষ্ট কোর্সের কমিশন হারের উপর নির্ভর করবে।
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
