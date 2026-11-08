import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { notFound } from "next/navigation";
import { Clock, BookOpen, CheckCircle, ShieldCheck, Award, ArrowRight, Play, UserCheck, HelpCircle } from "lucide-react";
import { CourseDetailClient } from "./CourseDetailClient";
import { processAffiliateClick, setAttributionCookie } from "@/lib/affiliate/tracking";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { ref?: string; checkout?: string };
}) {
  const course = await DataService.getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }

  // Handle Affiliate Attribution if referral code present
  if (searchParams.ref) {
    const cleanRef = searchParams.ref.trim().toUpperCase();
    try {
      await processAffiliateClick({
        referralCode: cleanRef,
        courseId: course.id,
        landingPage: `/courses/${course.slug}`,
      });
    } catch {
      // Safe fallback
    }
  }

  const commissionAmount = (course.price * course.commissionRate) / 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 pb-20">
        
        {/* Course Hero Banner */}
        <div className="bg-[#172033] text-white py-14 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 text-[#60A5FA] text-xs font-semibold">
                  <span>{course.categoryNameBn}</span>
                  <span>•</span>
                  <span>{course.difficulty}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug">
                  {course.titleBn}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {course.summaryBn}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#E53945]" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                    {formatBnNumber(course.totalLessons)} টি প্র্যাকটিক্যাল লেসন
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#16A34A]" />
                    কোর্স সমাপনী সার্টিফিকেট
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Course Body Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column (8 cols): Description & Syllabus */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* About Course */}
              <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-[#172033]">কোর্স সম্পর্কে বিস্তারিত</h2>
                <div className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">
                  {course.descriptionBn}
                </div>
              </div>

              {/* What you'll learn */}
              <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-[#172033]">এই কোর্সে যা যা শিখবেন</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "বাস্তব প্রজেক্টের মাধ্যমে হ্যান্ডস-অন কোডিং ও ডিজাইন",
                    "আন্তর্জাতিক মার্কেটপ্লেসের রিয়েল লাইফ ফ্রিল্যান্সিং গাইডলাইন",
                    "ইন্ডাস্ট্রি স্ট্যান্ডার্ড বেস্ট প্র্যাকটিস ও আর্কিটেকচার",
                    "প্রোডাকশন লেভেলে ডেপ্লয়মেন্ট ও পারফরম্যান্স অপ্টিমাইজেশন",
                    "লাইফটাইম সাপোর্ট কমিউনিটি ও নিয়মিত আপডেট",
                    "কোর্স কমপ্লিশন সার্টিফিকেট ও সিভি তৈরির গাইড",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#172033]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus / Modules */}
              <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#172033]">কোর্স কারিকুলাম ও মডিউল</h2>
                  <span className="text-xs font-semibold text-[#64748B]">
                    {formatBnNumber(course.modules.length)} টি মডিউল
                  </span>
                </div>

                {course.modules.length === 0 ? (
                  <p className="text-xs text-slate-500">কারিকুলাম শীঘ্রই বিস্তারিতভাবে আপডেট করা হবে।</p>
                ) : (
                  <div className="space-y-4">
                    {course.modules.map((mod, modIdx) => (
                      <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-5 py-3.5 font-bold text-sm text-[#172033] flex items-center justify-between">
                          <span>{mod.titleBn}</span>
                          <span className="text-xs text-[#64748B] font-normal">
                            {formatBnNumber(mod.lessons.length)} টি লেসন
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          {mod.lessons.map((lesson) => (
                            <div key={lesson.id} className="px-5 py-3 flex items-center justify-between text-xs text-[#475569] hover:bg-slate-50">
                              <div className="flex items-center gap-2.5">
                                <Play className="w-3.5 h-3.5 text-[#2563EB]" />
                                <span>{lesson.titleBn}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {lesson.isFreePreview && (
                                  <span className="text-[10px] font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded">
                                    ফ্রি প্রিভিউ
                                  </span>
                                )}
                                <span className="text-[#64748B]">{lesson.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (4 cols): Sticky Checkout & Pricing Card */}
            <div className="lg:col-span-4">
              <CourseDetailClient
                course={course}
                commissionAmount={commissionAmount}
                autoOpenCheckout={searchParams.checkout === "true"}
              />
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
