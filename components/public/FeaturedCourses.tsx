"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MockCourse } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

interface FeaturedCoursesProps {
  courses: MockCourse[];
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  const [isMarketer, setIsMarketer] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          data?.authenticated &&
          (data.user?.role === "AFFILIATE" || data.user?.role === "ADMIN")
        ) {
          setIsMarketer(true);
        } else {
          setIsMarketer(false);
        }
      })
      .catch(() => {
        setIsMarketer(false);
      });
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              সর্বোচ্চ কনভার্সন রেটের হট কোর্সসমূহ
            </h2>
            <p className="mt-2 text-base text-[#475569]">
              {isMarketer
                ? "এই কোর্সগুলোর প্রচার করে আমাদের মার্কেটাররা সবচেয়ে বেশি কমিশন অর্জন করছেন।"
                : "হাজারো শিক্ষার্থীর পছন্দের সেরা স্কিল কোর্সগুলো বেছে নিন আপনার ক্যারিয়ার গড়ার জন্য।"}
            </p>
          </div>
          <Link
            href="/courses"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>সব কোর্স দেখুন ({formatBnNumber(courses.length)} টি)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => {
            const commissionAmount = (course.price * course.commissionRate) / 100;
            const discountPercent = Math.round(
              ((course.originalPrice - course.price) / course.originalPrice) * 100
            );

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#2563EB]/40 shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Thumbnail & Badge */}
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

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#172033] text-base leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                      {course.titleBn}
                    </h3>
                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                      {course.summaryBn}
                    </p>
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {formatBnNumber(course.totalLessons)} টি পাঠ
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-extrabold text-[#172033]">
                          {formatBDT(course.price)}
                        </span>
                        <span className="text-xs text-[#64748B] line-through ml-2">
                          {formatBDT(course.originalPrice)}
                        </span>
                      </div>
                      {/* Show discount percentage for regular users */}
                      {!isMarketer && discountPercent > 0 && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                          {discountPercent}% ছাড়
                        </span>
                      )}
                    </div>

                    {/* Commission Callout ONLY for logged-in Marketers */}
                    {course.isAffiliateEligible && isMarketer && (
                      <div className="text-xs font-bold text-[#16A34A] flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span>প্রতি বিক্রয়ে আয়:</span>
                        <span>{formatBDT(commissionAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="text-center py-2 px-3 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#172033] transition-colors"
                    >
                      বিস্তারিত
                    </Link>
                    <Link
                      href={`/courses/${course.slug}?enroll=true`}
                      className="text-center py-2 px-3 rounded-lg bg-[#E53945] hover:bg-[#D12B37] text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      কোর্স কিনুন
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
