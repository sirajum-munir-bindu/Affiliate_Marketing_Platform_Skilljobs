import { Star, Quote } from "lucide-react";
import { mockDb } from "@/lib/db/mock-data";

export function TestimonialsSection() {
  const testimonials = mockDb.testimonials;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            আমাদের টপ অ্যাফিলিয়েটদের অভিজ্ঞতা
          </h2>
          <p className="mt-3 text-base text-[#475569]">
            দেখুন কীভাবে সোশ্যাল মিডিয়া ও স্টুডেন্ট নেটওয়ার্ক কাজে লাগিয়ে আমাদের মার্কেটাররা ঘরে বসেই নিশ্চিত আয় করছেন।
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-200 pointer-events-none" />

              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-[#475569] leading-relaxed italic">
                  "{item.quoteBn}"
                </p>
              </div>

              {/* Author & Verified Earnings */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">{item.name}</h4>
                  <p className="text-xs text-[#64748B]">{item.roleBn}</p>
                </div>
                {item.earningsText && (
                  <span className="text-[11px] font-extrabold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {item.earningsText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
