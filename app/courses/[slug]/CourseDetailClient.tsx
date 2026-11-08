"use client";

import { useState, useEffect } from "react";
import { MockCourse } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { CourseEnrollModal } from "@/components/public/CourseEnrollModal";
import { ShieldCheck, Share2, Sparkles, Check, ArrowRight } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          data?.authenticated &&
          (data.user?.role === "AFFILIATE" || data.user?.role === "ADMIN")
        ) {
          setIsMarketer(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="sticky top-28 bg-white rounded-2xl border border-[#E2E8F0] shadow-lg overflow-hidden space-y-6 p-6">
        {/* Course Thumbnail */}
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
          <img
            src={course.thumbnail}
            alt={course.titleBn}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Pricing Box */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#172033]">
              {formatBDT(course.price)}
            </span>
            <span className="text-base text-[#64748B] line-through">
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
            className="w-full py-4 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>এখনই ভর্তি হোন (bKash)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#475569] transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "কোর্স লিংক কপি হয়েছে!" : "কোর্স লিংক শেয়ার করুন"}</span>
          </button>
        </div>

        {/* Guarantees */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>ম্যানুয়াল bKash দ্রুত ও নিরাপদ ভেরিফিকেশন</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>আজীবন কোর্স এক্সেস ও মেন্টর সাপোর্ট</span>
          </div>
        </div>
      </div>

      <CourseEnrollModal
        course={course}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
