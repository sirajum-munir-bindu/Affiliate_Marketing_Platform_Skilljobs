"use client";

import { useState, useEffect } from "react";
import { MockCourse } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { CourseEnrollModal } from "@/components/public/CourseEnrollModal";
import { Share2, Check, ArrowRight, PlayCircle } from "lucide-react";

interface CourseDetailClientProps {
  course: MockCourse;
  commissionAmount: number;
  autoOpenCheckout?: boolean;
}

export function CourseDetailClient({
  course,
  commissionAmount,
  autoOpenCheckout = false,
}: CourseDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(autoOpenCheckout);
  const [copied, setCopied] = useState(false);
  const [isMarketer, setIsMarketer] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          data?.authenticated &&
          (data.user?.role === "AFFILIATE" || data.user?.role === "ADMIN")
        ) {
          setIsMarketer(true);
          if (data.user?.referralCode) {
            setRefCode(data.user.referralCode);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = refCode
        ? `${window.location.origin}/courses/${course.slug}?ref=${refCode}`
        : window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="sticky top-28 bg-white rounded-2xl border border-[#E2E8F0] shadow-lg overflow-hidden space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Course Thumbnail */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
          <img
            src={course.thumbnail}
            alt={course.titleBn}
            className="w-full h-full object-cover"
          />
          {course.previewVideoUrl && (
            <a
              href={course.previewVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-slate-950/35 hover:bg-slate-950/50 transition-colors flex flex-col items-center justify-center gap-2 text-white"
            >
              <span className="w-12 h-12 rounded-full bg-[#E53945] flex items-center justify-center shadow-lg">
                <PlayCircle className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold bg-black/70 px-3 py-1 rounded-full">
                ফ্রি প্রিভিউ ভিডিও দেখুন
              </span>
            </a>
          )}
        </div>

        {/* Pricing Box */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-[#172033]">
              {formatBDT(course.price)}
            </span>
            <span className="text-sm sm:text-base text-[#64748B] line-through">
              {formatBDT(course.originalPrice)}
            </span>
            <span className="text-xs font-bold text-[#E53945] bg-red-50 px-2 py-0.5 rounded">
              {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% ছাড়
            </span>
          </div>

          {/* Commission Box ONLY for logged-in Marketers */}
          {course.isAffiliateEligible && isMarketer && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-bold text-[#16A34A]">
              <span>অ্যাফিলিয়েট আর্নিং:</span>
              <span>{formatBDT(commissionAmount)} ({course.commissionRate}%)</span>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 sm:py-4 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>এখনই ভর্তি হোন (bKash)</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Share button ONLY visible when an Affiliate / Marketer is logged in */}
          {isMarketer && (
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-xs font-bold text-[#2563EB] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "রেফারেল লিংক কপি হয়েছে!" : "কোর্স রেফারেল লিংক শেয়ার করুন"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Floating Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#172033]">
              {formatBDT(course.price)}
            </span>
            <span className="text-[11px] text-[#64748B] line-through">
              {formatBDT(course.originalPrice)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold truncate">লাইফটাইম অ্যাক্সেস</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>এখনই ভর্তি হোন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <CourseEnrollModal
        course={course}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
