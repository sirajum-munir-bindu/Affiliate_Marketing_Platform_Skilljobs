import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { DataService } from "@/lib/services/data-service";
import { getSession } from "@/lib/auth/session";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { headers } from "next/headers";
import Link from "next/link";
import { BookOpen, Clock, Search, Filter } from "lucide-react";
import {
  processAffiliateClick,
  extractRequestContext,
  isPrefetchRequest,
} from "@/lib/affiliate/tracking";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; ref?: string };
}) {
  if (searchParams.ref) {
    const reqHeaders = headers();
    if (!isPrefetchRequest(reqHeaders)) {
      const cleanRef = searchParams.ref.trim().toUpperCase();
      const ctx = extractRequestContext(reqHeaders);
      try {
        await processAffiliateClick({
          referralCode: cleanRef,
          landingPage: searchParams.category
            ? `/courses?category=${searchParams.category}`
            : "/courses",
          ...ctx,
        });
      } catch {
        // Safe fallback
      }
    }
  }

  const session = await getSession();
  const isMarketer = Boolean(
    session && (session.role === "AFFILIATE" || session.role === "ADMIN")
  );

  const [allCourses, dynamicCategories] = await Promise.all([
    DataService.getCourses(true),
    DataService.getCategories(),
  ]);
  
  const filteredCourses = allCourses.filter((course) => {
    if (searchParams.category && course.categorySlug !== searchParams.category) {
      return false;
    }
    if (searchParams.q) {
      const q = searchParams.q.toLowerCase();
      return (
        course.titleBn.toLowerCase().includes(q) ||
        course.title.toLowerCase().includes(q) ||
        course.summaryBn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = [
    { label: "সকল কোর্স", slug: "" },
    ...dynamicCategories.map((cat) => ({
      label: cat.nameBn,
      slug: cat.slug,
    })),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            প্র্যাকটিক্যাল স্কিল ডেভেলপমেন্ট কোর্সসমূহ
          </h1>
          <p className="mt-3 text-base text-[#475569]">
            আন্তর্জাতিক মানসম্পন্ন প্রফেশনাল কারিকুলাম, বাস্তব প্রজেক্ট ও আজীবন মেন্টরশিপ সাপোর্ট।
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = (searchParams.category || "") === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={cat.slug ? `/courses?category=${cat.slug}` : "/courses"}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  isActive
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                    : "bg-white text-[#475569] border-[#E2E8F0] hover:border-slate-300"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-[#64748B] space-y-3">
            <p className="text-base font-semibold">কোনো কোর্স পাওয়া যায়নি।</p>
            <Link href="/courses" className="text-sm text-[#2563EB] font-bold underline">
              সকল কোর্স দেখুন
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const commissionAmount = (course.price * course.commissionRate) / 100;
              const discountPercent = Math.round(
                ((course.originalPrice - course.price) / course.originalPrice) * 100
              );

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#2563EB]/40 shadow-sm hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Commission badge ONLY for logged-in Marketers */}
                    {course.isAffiliateEligible && isMarketer && (
                      <div className="absolute top-3 left-3 bg-[#E53945] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                        {course.commissionRate}% কমিশন
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {course.categoryNameBn}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#172033] text-lg leading-snug group-hover:text-[#2563EB] transition-colors">
                        {course.titleBn}
                      </h3>
                      <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                        {course.summaryBn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        {formatBnNumber(course.totalLessons)} টি লেসন
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-[#172033]">
                          {formatBDT(course.price)}
                        </span>
                        <span className="text-xs text-[#64748B] line-through ml-2">
                          {formatBDT(course.originalPrice)}
                        </span>
                        {!isMarketer && discountPercent > 0 && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md ml-auto">
                            {discountPercent}% ছাড়
                          </span>
                        )}
                      </div>
                      {/* Commission info ONLY for logged-in Marketers */}
                      {course.isAffiliateEligible && isMarketer && (
                        <div className="text-xs font-bold text-[#16A34A] flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span>অ্যাফিলিয়েট কমিশন:</span>
                          <span>{formatBDT(commissionAmount)}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-center py-2.5 px-3 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#172033] transition-colors"
                      >
                        বিস্তারিত দেখুন
                      </Link>
                      <Link
                        href={`/courses/${course.slug}?checkout=true`}
                        className="text-center py-2.5 px-3 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        কোর্স এনরোল
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
