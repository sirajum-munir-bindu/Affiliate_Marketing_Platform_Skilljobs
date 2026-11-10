import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { DataService } from "@/lib/services/data-service";
import { DEFAULT_INSTRUCTOR, DEFAULT_LEARNING_OUTCOMES } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { notFound } from "next/navigation";
import { Clock, BookOpen, CheckCircle, Award, PlayCircle } from "lucide-react";
import { CourseDetailClient } from "./CourseDetailClient";
import { processAffiliateClick } from "@/lib/affiliate/tracking";

export const dynamic = "force-dynamic";

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

  const instructor = course.instructor || DEFAULT_INSTRUCTOR;
  const learningOutcomes =
    course.learningOutcomes && course.learningOutcomes.length > 0
      ? course.learningOutcomes
      : DEFAULT_LEARNING_OUTCOMES;

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
                  {learningOutcomes.map((text, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#172033]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Curriculum / Modules */}
              {course.modules && course.modules.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-[#172033]">কোর্স কারিকুলাম ও সিলেবাস</h2>
                    <span className="text-xs font-semibold text-[#64748B] bg-slate-100 px-3 py-1 rounded-full">
                      {formatBnNumber(course.modules.length)} টি মডিউল
                    </span>
                  </div>

                  <div className="space-y-4">
                    {course.modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="rounded-xl border border-slate-200 overflow-hidden"
                      >
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm text-[#172033]">{mod.titleBn}</h3>
                          <span className="text-[11px] font-semibold text-[#64748B] shrink-0">
                            {formatBnNumber(mod.lessons.length)} টি লেসন
                          </span>
                        </div>
                        {mod.lessons.length > 0 && (
                          <div className="divide-y divide-slate-100">
                            {mod.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#475569]"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <PlayCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                                  <span className="truncate font-medium text-[#172033]">
                                    {lesson.titleBn}
                                  </span>
                                  {lesson.isFreePreview && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200 text-[10px] font-bold shrink-0">
                                      ফ্রি প্রিভিউ
                                    </span>
                                  )}
                                </div>
                                {lesson.duration && (
                                  <span className="text-xs text-[#64748B] shrink-0">
                                    {lesson.duration}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Instructor */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-[#172033]">কোর্স ইন্সট্রাক্টর</h2>

                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                  />

                  <div className="space-y-2 flex-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-[#172033]">
                          {instructor.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          instructor.instructorType === "CO"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-[#2563EB] border-blue-200"
                        }`}>
                          {instructor.instructorTypeBn || (instructor.instructorType === "CO" ? "কো-ইন্সট্রাক্টর" : "লিড ইন্সট্রাক্টর")}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-medium">
                        {instructor.designation}
                      </p>
                    </div>

                    <p className="text-sm text-[#475569] leading-relaxed">
                      {instructor.description}
                    </p>
                  </div>
                </div>
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
