import { TrendingUp, Link as LinkIcon, DollarSign, MousePointerClick, ShieldCheck } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            মার্কেটারদের জন্য ডেডিকেটেড হাই-টেক ড্যাশবোর্ড
          </h2>
          <p className="mt-3 text-base text-[#475569]">
            রিয়েল-টাইম ক্লিক ট্র্যাকিং, অটোমেটিক কমিশন ব্যালেন্স আপডেট ও এক ক্লিকে bKash পে-আউট রিকোয়েস্ট সুবিধা।
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Border Glow & Shadow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#2563EB]/20 via-[#E53945]/20 to-[#16A34A]/20 blur-xl opacity-70 -z-10" />

          {/* Actual Mockup Shell */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden">
            
            {/* Top Browser Bar */}
            <div className="bg-slate-900 text-white px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] sm:text-xs text-slate-400 font-mono ml-2 sm:ml-3 truncate max-w-[160px] sm:max-w-none">
                  skilljobs.com/affiliate/dashboard
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-800 shrink-0 whitespace-nowrap">
                লাইভ প্রিভিউ ডেমো
              </span>
            </div>

            {/* Mock Dashboard Interior */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-[#F8FAFC]">
              
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs sm:shadow-sm">
                  <div className="flex items-center justify-between text-[#64748B] text-[11px] sm:text-xs font-semibold mb-1">
                    <span>মোট ক্লিক</span>
                    <MousePointerClick className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033]">৪২০</div>
                  <div className="text-[10px] sm:text-[11px] text-[#16A34A] font-semibold mt-1">↑ ১২% বৃদ্ধি</div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs sm:shadow-sm">
                  <div className="flex items-center justify-between text-[#64748B] text-[11px] sm:text-xs font-semibold mb-1">
                    <span>কনভার্সন (বিক্রি)</span>
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E53945]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033]">২৮ টি</div>
                  <div className="text-[10px] sm:text-[11px] text-[#2563EB] font-semibold mt-1 truncate">৬.৬% কনভার্সন</div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs sm:shadow-sm">
                  <div className="flex items-center justify-between text-[#64748B] text-[11px] sm:text-xs font-semibold mb-1">
                    <span>বর্তমান ব্যালেন্স</span>
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#16A34A]">৳ ৩,২০০</div>
                  <div className="text-[10px] sm:text-[11px] text-[#64748B] mt-1">উত্তোলনযোগ্য</div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs sm:shadow-sm">
                  <div className="flex items-center justify-between text-[#64748B] text-[11px] sm:text-xs font-semibold mb-1">
                    <span>মোট উপার্জিত</span>
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#172033]">৳ ১৫,৪০০</div>
                  <div className="text-[10px] sm:text-[11px] text-[#64748B] mt-1">লাইফটাইম আর্নিং</div>
                </div>

              </div>

              {/* Referral Link Quick Tool Preview */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#2563EB]/30 shadow-xs sm:shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1 text-center sm:text-left min-w-0">
                  <span className="text-xs font-bold text-[#2563EB] flex items-center gap-1.5 justify-center sm:justify-start">
                    <LinkIcon className="w-3.5 h-3.5" />
                    আপনার ইউনিক রেফারেল কোড
                  </span>
                  <div className="font-mono text-xs sm:text-sm md:text-base font-extrabold text-[#172033] break-all">
                    https://skilljobs.com/courses?ref=TANVIR50
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors shadow-xs shrink-0"
                >
                  লিংক কপি করুন
                </button>
              </div>

              {/* Chart Mockup Bar Preview */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#172033]">
                    দৈনিক ক্লিক ও কনভার্সন অ্যানালিটিক্স
                  </h4>
                  <span className="text-xs text-[#64748B]">বিগত ৭ দিন</span>
                </div>
                <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100">
                  {[35, 60, 45, 80, 50, 95, 70].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-[#2563EB] to-blue-400 rounded-t-md hover:from-[#E53945] hover:to-red-400 transition-colors"
                      />
                      <span className="text-[10px] text-[#64748B]">দিন {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
