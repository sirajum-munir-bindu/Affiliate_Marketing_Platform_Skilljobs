"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Play } from "lucide-react";

export interface HeroVideoSettings {
  title?: string;
  subtitle?: string;
  videoUrl?: string;
  embedUrl?: string;
  durationText?: string;
  buttonText?: string;
  thumbnailUrl?: string;
  isEnabled?: boolean;
}

interface HeroProps {
  videoSettings?: HeroVideoSettings;
}

export function Hero({ videoSettings }: HeroProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const title = videoSettings?.title || "স্কিলজবস অ্যাফিলিয়েশন প্রোগ্রাম";
  const subtitle = videoSettings?.subtitle || "অফিসিয়াল ভিডিও গাইড";
  const durationText = videoSettings?.durationText || "ভিডিও ওভারভিউ • ২:৪৯ মিনিট";
  const buttonText = videoSettings?.buttonText || "এখনই দেখুন";
  const thumbnailUrl = videoSettings?.thumbnailUrl || "/images/video-preview.jpg";
  const embedUrl = videoSettings?.embedUrl || "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";
  const isEnabled = videoSettings?.isEnabled !== false;

  const videoShowcase = (
    <div className="relative mx-auto max-w-lg lg:max-w-none">
      {/* Decorative Accent Badges */}
      {/* Top-left Orange Shape */}
      <div
        className="hidden sm:block absolute -top-3 -left-3 sm:-top-5 sm:-left-5 w-20 sm:w-28 h-20 sm:h-28 bg-[#F59E0B] rounded-3xl -z-10 shadow-lg shadow-amber-500/20"
        aria-hidden="true"
      />

      {/* Bottom-right Green Shape */}
      <div
        className="hidden sm:block absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 w-20 sm:w-28 h-20 sm:h-28 bg-[#10B981] rounded-3xl -z-10 shadow-lg shadow-emerald-500/20"
        aria-hidden="true"
      />

      {/* Video Player Card */}
      <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-slate-900">
        {isPlaying ? (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer group"
            role="button"
            tabIndex={0}
            aria-label="ভিডিও চালু করুন"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setIsPlaying(true);
            }}
          >
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 group-hover:bg-black/40 transition-colors" />

            {/* Top Bar inside Video Preview */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white drop-shadow-lg z-10">
              <div className="flex items-center gap-2.5 sm:gap-3 bg-black/40 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-white/15">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                  <Image
                    src="/images/icon.png"
                    alt="Logo Icon"
                    width={44}
                    height={44}
                    priority
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold block leading-tight text-white drop-shadow">
                    {title}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 block">
                    {subtitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Centered Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/40 animate-ping" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-[#E53945] flex items-center justify-center shadow-2xl group-hover:scale-110 group-active:scale-95 transition-all">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
                </div>
              </div>
            </div>

            {/* Bottom Duration & Progress Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] sm:text-xs font-medium text-white/90 drop-shadow">
              <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                {durationText}
              </span>
              <span className="bg-[#E53945] px-2 py-0.5 rounded-md font-semibold text-white">
                {buttonText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${isEnabled ? "lg:grid-cols-12" : "lg:grid-cols-1 max-w-4xl mx-auto"} gap-12 lg:gap-8 items-center`}>
          
          {/* Left Column: Storytelling Headline & Actions */}
          <div className={`${isEnabled ? "lg:col-span-7" : "lg:col-span-1"} text-center ${isEnabled ? "lg:text-left" : "lg:text-center"} space-y-6`}>
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-[#172033] leading-[1.2] tracking-tight">
              ঘরে বসেই{" "}
              <span className="text-[#E53945] relative inline-block">
                আয় করুন
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#E53945]/30 -z-10"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  fill="currentColor"
                >
                  <path d="M0,8 Q50,0 100,8 Q50,14 0,8 Z" />
                </svg>
              </span>
            </h1>

            {/* Mobile Video Showcase (visible on phone/tablet, hidden on desktop lg+) */}
            {isEnabled && (
              <div className="block lg:hidden pt-3 pb-2">
                {videoShowcase}
              </div>
            )}

            {/* Feature Bullets */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pb-2 text-left max-w-md mx-auto ${isEnabled ? "lg:mx-0" : "lg:mx-auto"}`}>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#172033]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>স্বচ্ছ bKash পে-আউট</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#172033]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>রেফারেল লিংক জেনারেটর</span>
              </div>
            </div>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row items-center justify-center ${isEnabled ? "lg:justify-start" : "lg:justify-center"} gap-3 sm:gap-4 pt-3 sm:pt-4`}>
              <Link
                href="/register?role=affiliate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white text-sm sm:text-base font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all group"
              >
                <span>অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Micro Trust Stats */}
            <div className={`pt-3 sm:pt-4 flex flex-wrap items-center justify-center ${isEnabled ? "lg:justify-start" : "lg:justify-center"} gap-4 sm:gap-6 text-xs text-[#64748B]`}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>১০০% নিরাপদ ও ভেরিফাইড</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#E53945]" />
                <span>৫০০+ সক্রিয় মার্কেটার</span>
              </div>
            </div>
          </div>

          {/* Desktop Right Column: Video Showcase (visible on desktop lg+, hidden on mobile) */}
          {isEnabled && (
            <div className="hidden lg:block lg:col-span-5 relative">
              {videoShowcase}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
