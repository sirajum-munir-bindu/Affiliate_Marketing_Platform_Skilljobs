import { Star, Quote } from "lucide-react";
import { MockTestimonial, mockDb } from "@/lib/db/mock-data";

interface TestimonialsSectionProps {
  testimonials?: MockTestimonial[];
}

export function TestimonialsSection({ testimonials: initialTestimonials }: TestimonialsSectionProps) {
  const allTestimonials = initialTestimonials || mockDb.testimonials || [];
  const publishedTestimonials = allTestimonials.filter((item) => item.isPublished !== false);

  if (publishedTestimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            আমাদের টপ অ্যাফিলিয়েটদের অভিজ্ঞতা
          </h2>
          <p className="mt-3 text-base text-[#475569]">
            দেখুন কীভাবে সোশ্যাল মিডিয়া ও স্টুডেন্ট নেটওয়ার্ক কাজে লাগিয়ে আমাদের মার্কেটাররা ঘরে বসেই নিশ্চিত আয় করছেন।
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {publishedTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative"
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
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#172033] truncate">{item.name}</h4>
                    <p className="text-xs text-[#64748B] truncate">{item.roleBn}</p>
                  </div>
                </div>
                {item.earningsText && (
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 shrink-0 whitespace-nowrap">
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
