"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  BarChart3,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Play,
  Copy,
  Sliders,
  ShieldCheck,
  Users,
  ShoppingBag,
  Banknote,
  BookOpen,
  Info,
  Check,
  MousePointerClick,
  TrendingUp,
  LineChart,
  ArrowUpRight,
  MessageSquareQuote,
} from "lucide-react";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { MockPlatformSettings } from "@/lib/db/mock-data";
import { AdminAnalyticsData } from "@/lib/services/data-service";

interface HomepageControlClientProps {
  initialSettings: MockPlatformSettings;
  liveStats: {
    totalAffiliates: number;
    totalSales: number;
    totalRevenue: number;
    totalCommissionPaid: number;
    totalAvailableCourses: number;
  };
  analyticsData?: AdminAnalyticsData;
}

export function HomepageControlClient({
  initialSettings,
  liveStats,
  analyticsData,
}: HomepageControlClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "video" | "stats" | "analytics">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Video State
  const [videoTitle, setVideoTitle] = useState(initialSettings.video.title);
  const [videoSubtitle, setVideoSubtitle] = useState(initialSettings.video.subtitle);
  const [videoUrl, setVideoUrl] = useState(initialSettings.video.videoUrl);
  const [durationText, setDurationText] = useState(initialSettings.video.durationText);
  const [buttonText, setButtonText] = useState(initialSettings.video.buttonText);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialSettings.video.thumbnailUrl);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialSettings.video.isEnabled);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Stats Counter State
  const [isManualStats, setIsManualStats] = useState(initialSettings.stats.isManual);
  const [manualAffiliates, setManualAffiliates] = useState<number>(
    initialSettings.stats.manualAffiliates ?? 120
  );
  const [manualSales, setManualSales] = useState<number>(
    initialSettings.stats.manualSales ?? 450
  );
  const [manualCommissionPaid, setManualCommissionPaid] = useState<number>(
    initialSettings.stats.manualCommissionPaid ?? 68000
  );
  const [manualAvailableCourses, setManualAvailableCourses] = useState<number>(
    initialSettings.stats.manualAvailableCourses ?? 4
  );

  // Dashboard Analytics State (Traffic clicks, conversions, revenue & commission flow)
  const [isManualAnalytics, setIsManualAnalytics] = useState(
    initialSettings.dashboardAnalytics?.isManual ?? false
  );
  const [manualClicks, setManualClicks] = useState<number>(
    initialSettings.dashboardAnalytics?.totalClicks ?? analyticsData?.totalClicks ?? 420
  );
  const [manualConversions, setManualConversions] = useState<number>(
    initialSettings.dashboardAnalytics?.totalConversions ?? analyticsData?.totalConversions ?? 28
  );
  const [manualTurnover7d, setManualTurnover7d] = useState<number>(
    initialSettings.dashboardAnalytics?.summaryTurnover7d ?? analyticsData?.chartDatasets["7d"].summaryTurnover ?? 142000
  );
  const [manualPayout7d, setManualPayout7d] = useState<number>(
    initialSettings.dashboardAnalytics?.summaryPayout7d ?? analyticsData?.chartDatasets["7d"].summaryPayout ?? 28400
  );
  const [manualOrders7d, setManualOrders7d] = useState<number>(
    initialSettings.dashboardAnalytics?.summaryOrders7d ?? analyticsData?.chartDatasets["7d"].summaryOrders ?? 69
  );

  // Helper to extract embed url for live preview
  const getEmbedPreviewUrl = (url: string) => {
    if (!url || !url.trim()) return "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.trim().match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    if (url.includes("/embed/")) {
      return url.includes("autoplay=1") ? url : `${url}${url.includes("?") ? "&" : "?"}autoplay=1&rel=0`;
    }
    return url;
  };

  const handleCopyLiveStats = () => {
    setManualAffiliates(liveStats.totalAffiliates || 1);
    setManualSales(liveStats.totalSales || 1);
    setManualCommissionPaid(liveStats.totalCommissionPaid || 5000);
    setManualAvailableCourses(liveStats.totalAvailableCourses || 4);
    setIsManualStats(true);
    setStatusMessage({
      type: "success",
      text: "লাইভ ডাটাবেজ থেকে বর্তমান সংখ্যাগুলো ম্যানুয়াল ইনপুটে কপি করা হয়েছে!",
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSetMarketingDefaults = () => {
    setManualAffiliates(120);
    setManualSales(450);
    setManualCommissionPaid(68000);
    setManualAvailableCourses(4);
    setIsManualStats(true);
    setStatusMessage({
      type: "success",
      text: "মার্কেটিং প্রমোশনাল স্ট্যান্ডার্ড ডিফল্ট ভ্যালু সেট করা হয়েছে!",
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCopyLiveAnalytics = () => {
    if (analyticsData) {
      setManualClicks(analyticsData.totalClicks);
      setManualConversions(analyticsData.totalConversions);
      setManualTurnover7d(analyticsData.chartDatasets["7d"].summaryTurnover);
      setManualPayout7d(analyticsData.chartDatasets["7d"].summaryPayout);
      setManualOrders7d(analyticsData.chartDatasets["7d"].summaryOrders);
      setIsManualAnalytics(true);
      setStatusMessage({
        type: "success",
        text: "লাইভ ডাটাবেজ থেকে অ্যানালিটিক্স সংখ্যা কপি করা হয়েছে!",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleSetAnalyticsDefaults = () => {
    setManualClicks(420);
    setManualConversions(28);
    setManualTurnover7d(142000);
    setManualPayout7d(28400);
    setManualOrders7d(69);
    setIsManualAnalytics(true);
    setStatusMessage({
      type: "success",
      text: "অ্যানালিটিক্স স্ট্যান্ডার্ড ডিফল্ট ভ্যালু সেট করা হয়েছে!",
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        video: {
          title: videoTitle.trim(),
          subtitle: videoSubtitle.trim(),
          videoUrl: videoUrl.trim(),
          durationText: durationText.trim(),
          buttonText: buttonText.trim(),
          thumbnailUrl: thumbnailUrl.trim() || "/images/video-preview.jpg",
          isEnabled: isVideoEnabled,
        },
        stats: {
          isManual: isManualStats,
          manualAffiliates: Number(manualAffiliates) || 0,
          manualSales: Number(manualSales) || 0,
          manualCommissionPaid: Number(manualCommissionPaid) || 0,
          manualAvailableCourses: Number(manualAvailableCourses) || 0,
        },
        dashboardAnalytics: {
          isManual: isManualAnalytics,
          totalClicks: Number(manualClicks) || 0,
          totalConversions: Number(manualConversions) || 0,
          summaryTurnover7d: Number(manualTurnover7d) || 0,
          summaryPayout7d: Number(manualPayout7d) || 0,
          summaryOrders7d: Number(manualOrders7d) || 0,
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "সংরক্ষণ করতে সমস্যা হয়েছে");

      setStatusMessage({
        type: "success",
        text: "হোমপেজের ভিডিও এবং কাউন্টার সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Compute values for live preview of stats
  const previewAffiliates = isManualStats ? manualAffiliates : liveStats.totalAffiliates;
  const previewSales = isManualStats ? manualSales : liveStats.totalSales;
  const previewCommission = isManualStats ? manualCommissionPaid : liveStats.totalCommissionPaid;
  const previewCourses = isManualStats ? manualAvailableCourses : liveStats.totalAvailableCourses;

  // Compute values for live preview of dashboard analytics
  const previewClicks = isManualAnalytics ? manualClicks : (analyticsData?.totalClicks ?? 420);
  const previewConversions = isManualAnalytics ? manualConversions : (analyticsData?.totalConversions ?? 28);
  const previewConversionRate = previewClicks > 0 ? ((previewConversions / previewClicks) * 100).toFixed(1) : "0.0";
  const previewTurnover7d = isManualAnalytics ? manualTurnover7d : (analyticsData?.chartDatasets["7d"].summaryTurnover ?? 142000);
  const previewPayout7d = isManualAnalytics ? manualPayout7d : (analyticsData?.chartDatasets["7d"].summaryPayout ?? 28400);
  const previewOrders7d = isManualAnalytics ? manualOrders7d : (analyticsData?.chartDatasets["7d"].summaryOrders ?? 69);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300">
              <Sliders className="w-3.5 h-3.5" />
              <span>হোমপেজ ম্যানুয়াল কন্ট্রোল সেন্টার</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              ভিডিও গাইড ও কাউন্টার ম্যানেজমেন্ট
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              হোমপেজের অফিসিয়াল ভিডিও শোকেস এবং প্ল্যাটফর্ম পরিসংখ্যান (কাউন্টার) সরাসরি এখান থেকে নিয়ন্ত্রণ করুন। পরিবর্তনগুলো ওয়েবসাইটে অবিলম্বে প্রতিফলিত হয়।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/testimonials"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold transition-all shadow-md backdrop-blur-md hover:scale-[1.02]"
            >
              <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
              <span>টপ অ্যাফিলিয়েট অভিজ্ঞতা</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs sm:text-sm font-bold transition-all shadow-md backdrop-blur-md hover:scale-[1.02]"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>হোমপেজ লাইভ দেখুন</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold transition-all shadow-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-xl">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "all"
              ? "bg-[#0B1120] text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          সকল সেকশন (All)
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "video"
              ? "bg-red-600 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>ভিডিও গাইড</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "stats"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>হোমপেজ কাউন্টার</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>ড্যাশবোর্ড অ্যানালিটিক্স</span>
        </button>
      </div>

      <div className="space-y-10">
        {/* ======================================================== */}
        {/* PORTION 1: HERO VIDEO GUIDE SETTINGS                     */}
        {/* ======================================================== */}
        {(activeTab === "all" || activeTab === "video") && (
          <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    ১. হোমপেজ ভিডিও গাইড সেকশন
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Hero Video
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    হোমপেজের ডানপাশে প্রদর্শিত অফিশিয়াল ভিডিও টিউটোরিয়াল এবং তথ্য নিয়ন্ত্রণ করুন
                  </p>
                </div>
              </div>

              {/* Video Visibility Switch Toggle */}
              <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  ভিডিও সেকশন দৃশ্যমানতা:
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVideoEnabled}
                    onChange={(e) => setIsVideoEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-2 text-xs font-black text-slate-900">
                    {isVideoEnabled ? "চালু" : "বন্ধ"}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls Column */}
              <div className="lg:col-span-7 space-y-4">
                {/* Video Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ভিডিওর প্রধান শিরোনাম (Title)
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="স্কিলজবস অ্যাফিলিয়েশন প্রোগ্রাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                {/* Subtitle / Badge */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    সাব-টাইটেল / ব্যাজ টেক্সট
                  </label>
                  <input
                    type="text"
                    value={videoSubtitle}
                    onChange={(e) => setVideoSubtitle(e.target.value)}
                    placeholder="অফিসিয়াল ভিডিও গাইড"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>ইউটিউব ভিডিও লিংক (YouTube URL)</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      সাধারণ বা শর্ট লিংক সাপোর্ট করে
                    </span>
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setPreviewPlaying(false);
                    }}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>
                      উদাহরণ: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">https://www.youtube.com/watch?v=dQw4w9WgXcQ</code> বা <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">https://youtu.be/dQw4w9WgXcQ</code>
                    </span>
                  </p>
                </div>

                {/* Duration & Button Text Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      সময়কাল ব্যাজ টেক্সট
                    </label>
                    <input
                      type="text"
                      value={durationText}
                      onChange={(e) => setDurationText(e.target.value)}
                      placeholder="ভিডিও ওভারভিউ • ২:৪৯ মিনিট"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      বাটন টেক্সট
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="এখনই দেখুন"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Thumbnail Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    থাম্বনেইল ইমেজ URL (ডিফল্ট: /images/video-preview.jpg)
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="/images/video-preview.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Real-Time Video Preview Column */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    রিয়েল-টাইম লাইভ প্রিভিউ
                  </span>
                  {previewPlaying && (
                    <button
                      onClick={() => setPreviewPlaying(false)}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      প্রিভিউ রিসেট
                    </button>
                  )}
                </div>

                {/* Video Card Preview */}
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-slate-900">
                  {previewPlaying ? (
                    <iframe
                      className="w-full h-full"
                      src={getEmbedPreviewUrl(videoUrl)}
                      title={videoTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      onClick={() => setPreviewPlaying(true)}
                      className="relative w-full h-full cursor-pointer group"
                      role="button"
                      tabIndex={0}
                    >
                      <Image
                        src={thumbnailUrl || "/images/video-preview.jpg"}
                        alt={videoTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 group-hover:bg-black/40 transition-colors" />

                      {/* Top Bar Preview */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-white z-10">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15">
                          <div className="w-7 h-7 rounded-lg bg-white p-1 shadow-sm flex items-center justify-center shrink-0">
                            <Image
                              src="/images/icon.png"
                              alt="Logo"
                              width={28}
                              height={28}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold block leading-tight text-white drop-shadow">
                              {videoTitle || "স্কিলজবস অ্যাফিলিয়েশন প্রোগ্রাম"}
                            </span>
                            <span className="text-[9px] font-medium text-slate-200 block">
                              {videoSubtitle || "অফিসিয়াল ভিডিও গাইড"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-[#E53945] flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Bar */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-medium text-white/90">
                        <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                          {durationText || "ভিডিও ওভারভিউ • ২:৪৯ মিনিট"}
                        </span>
                        <span className="bg-[#E53945] px-2 py-0.5 rounded font-semibold text-white">
                          {buttonText || "এখনই দেখুন"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  💡 প্লে বাটনে ক্লিক করে প্রিভিউ ভিডিও টেস্ট করতে পারেন।
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* PORTION 2: PLATFORM STATS COUNTER SETTINGS               */}
        {/* ======================================================== */}
        {(activeTab === "all" || activeTab === "stats") && (
          <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    ২. প্ল্যাটফর্ম পরিসংখ্যান (কাউন্টার বার)
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Stats Counter
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    হোমপেজের ব্যানার নিচে ৪টি পরিসংখ্যান কার্ডের মান নিয়ন্ত্রণ করুন
                  </p>
                </div>
              </div>

              {/* Mode Toggle Switch (Auto DB vs Manual Custom) */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsManualStats(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !isManualStats
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ডাটাবেজ অটোমেটিক
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualStats(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isManualStats
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ম্যানুয়াল কাস্টম মোড
                </button>
              </div>
            </div>

            {/* Quick Helper Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  বর্তমান মোড:{" "}
                  <strong className={isManualStats ? "text-red-600 font-black" : "text-blue-600 font-black"}>
                    {isManualStats ? "ম্যানুয়াল কাস্টম সংখ্যা সক্রিয়" : "ডাটাবেজের লাইভ সংখ্যা সক্রিয়"}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLiveStats}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>লাইভ ডাটাবেজ সংখ্যা কপি করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetMarketingDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>মার্কেটিং ডিফল্ট সেট করুন</span>
                </button>
              </div>
            </div>

            {/* 4 Editable Stats Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Field 1: Active Affiliates */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    কার্ড ১
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  সক্রিয় অ্যাফিলিয়েট
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={manualAffiliates}
                    onChange={(e) => {
                      setManualAffiliates(Number(e.target.value));
                      setIsManualStats(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    +
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ডিবি লাইভ: <strong className="text-slate-600">{liveStats.totalAffiliates}</strong>
                </div>
              </div>

              {/* Field 2: Successful Course Sales */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-red-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E53945] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    কার্ড ২
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  সফল কোর্স বিক্রি
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={manualSales}
                    onChange={(e) => {
                      setManualSales(Number(e.target.value));
                      setIsManualStats(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    +
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ডিবি লাইভ: <strong className="text-slate-600">{liveStats.totalSales}</strong>
                </div>
              </div>

              {/* Field 3: Total Commission Paid */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    কার্ড ৩
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  মোট কমিশন প্রদান (টাকা)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={manualCommissionPaid}
                    onChange={(e) => {
                      setManualCommissionPaid(Number(e.target.value));
                      setIsManualStats(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    ৳
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ডিবি লাইভ: <strong className="text-slate-600">{formatBDT(liveStats.totalCommissionPaid)}</strong>
                </div>
              </div>

              {/* Field 4: Available Professional Courses */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    কার্ড ৪
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  উপলব্ধ প্রফেশনাল কোর্স
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={manualAvailableCourses}
                    onChange={(e) => {
                      setManualAvailableCourses(Number(e.target.value));
                      setIsManualStats(true);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    টি
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ডিবি লাইভ: <strong className="text-slate-600">{liveStats.totalAvailableCourses}</strong>
                </div>
              </div>
            </div>

            {/* Live Counter Preview Box */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  হোমপেজে কাউন্টার যেমন দেখাবে (লাইভ প্রিভিউ)
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {isManualStats ? "কাস্টম সংখ্যা মোড" : "ডাটাবেজ লাইভ মোড"}
                </span>
              </div>

              {/* Direct Render of Stats Counter Component Look */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-4 sm:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {/* Card 1 */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-2 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs sm:shadow-sm">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl lg:text-2xl font-black text-[#172033] tracking-tight">
                        {formatBnNumber(previewAffiliates || 0)}+
                      </div>
                      <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-[#475569] mt-0.5">
                        সক্রিয় অ্যাফিলিয়েট
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-2 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center shrink-0 shadow-xs sm:shadow-sm">
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl lg:text-2xl font-black text-[#172033] tracking-tight">
                        {formatBnNumber(previewSales || 0)}+
                      </div>
                      <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-[#475569] mt-0.5">
                        সফল কোর্স বিক্রি
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-2 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0 shadow-xs sm:shadow-sm">
                      <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl lg:text-2xl font-black text-[#172033] tracking-tight">
                        {formatBDT(previewCommission || 0)}
                      </div>
                      <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-[#475569] mt-0.5">
                        মোট কমিশন প্রদান
                      </div>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 p-2 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs sm:shadow-sm">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-xl lg:text-2xl font-black text-[#172033] tracking-tight">
                        {formatBnNumber(previewCourses || 0)} টি
                      </div>
                      <div className="text-[11px] sm:text-xs lg:text-sm font-medium text-[#475569] mt-0.5">
                        উপলব্ধ প্রফেশনাল কোর্স
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* PORTION 3: DASHBOARD ANALYTICS & CHARTS SETTINGS         */}
        {/* ======================================================== */}
        {(activeTab === "all" || activeTab === "analytics") && (
          <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                  <LineChart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    ৩. ড্যাশবোর্ড অ্যানালিটিক্স ও সেলস গ্রাফ কন্ট্রোল
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Analytics & Charts
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    ড্যাশবোর্ডের ৪টি মূল অংশ (ট্র্যাফিক ক্লিক, কনভার্সন রেট, ৭ দিনের টার্নওভার/পেআউট/অর্ডার এবং শীর্ষ কোর্স তালিকা) নিয়ন্ত্রণ করুন
                  </p>
                </div>
              </div>

              {/* Mode Toggle Switch (Auto DB vs Manual Custom) */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsManualAnalytics(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !isManualAnalytics
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ডাটাবেজ অটোমেটিক ডাইনামিক
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualAnalytics(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isManualAnalytics
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ম্যানুয়াল কাস্টম মোড
                </button>
              </div>
            </div>

            {/* Quick Helper Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  বর্তমান মোড:{" "}
                  <strong className={isManualAnalytics ? "text-emerald-700 font-black" : "text-blue-600 font-black"}>
                    {isManualAnalytics ? "ম্যানুয়াল কাস্টম সংখ্যা সক্রিয়" : "ডাটাবেজের লাইভ ডাইনামিক মেট্রিক্স সক্রিয়"}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLiveAnalytics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>লাইভ ডাটাবেজ সংখ্যা কপি করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetAnalyticsDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>ডিফল্ট সংখ্যা সেট করুন</span>
                </button>
              </div>
            </div>

            {/* 5 Editable Analytics Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Field 1: Total Clicks */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                    ছবি ১
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  অ্যাফিলিয়েট ট্র্যাফিক ক্লিক
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualClicks}
                  onChange={(e) => {
                    setManualClicks(Number(e.target.value));
                    setIsManualAnalytics(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <div className="text-[11px] text-slate-400">
                  রেফারেল লিংকের ভিজিট
                </div>
              </div>

              {/* Field 2: Total Conversions */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-teal-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    ছবি ২
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  সফল কনভার্সন সেলস
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualConversions}
                  onChange={(e) => {
                    setManualConversions(Number(e.target.value));
                    setIsManualAnalytics(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <div className="text-[11px] text-slate-400">
                  কনভার্সন হার: <strong className="text-teal-600 font-bold">{previewConversionRate}%</strong>
                </div>
              </div>

              {/* Field 3: 7-Day Turnover */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ছবি ৩ (রাজস্ব)
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  ৭ দিনের টার্নওভার (টাকা)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={manualTurnover7d}
                  onChange={(e) => {
                    setManualTurnover7d(Number(e.target.value));
                    setIsManualAnalytics(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <div className="text-[11px] text-slate-400">
                  প্রদর্শন: <strong className="text-slate-700 font-bold">{formatBDT(previewTurnover7d)}</strong>
                </div>
              </div>

              {/* Field 4: 7-Day Payout */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    ছবি ৩ (পেআউট)
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  ৭ দিনের পেআউট (টাকা)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={manualPayout7d}
                  onChange={(e) => {
                    setManualPayout7d(Number(e.target.value));
                    setIsManualAnalytics(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <div className="text-[11px] text-slate-400">
                  প্রদর্শন: <strong className="text-slate-700 font-bold">{formatBDT(previewPayout7d)}</strong>
                </div>
              </div>

              {/* Field 5: 7-Day Orders */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    ছবি ৩ (অর্ডার)
                  </span>
                </div>
                <label className="block text-xs font-bold text-slate-700">
                  ৭ দিনের সফল অর্ডার
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualOrders7d}
                  onChange={(e) => {
                    setManualOrders7d(Number(e.target.value));
                    setIsManualAnalytics(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <div className="text-[11px] text-slate-400">
                  প্রদর্শন: <strong className="text-slate-700 font-bold">{formatBnNumber(previewOrders7d)} টি</strong>
                </div>
              </div>
            </div>

            {/* Interactive Live Preview of Dashboard Analytics */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ড্যাশবোর্ডে অ্যানালিটিক্স যেভাবে লাইভ দেখাবে (রিয়েল-টাইম প্রিভিউ)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Preview Image 1: Traffic Clicks Card */}
                <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-700">
                        অ্যাফিলিয়েট ট্র্যাফিক ক্লিক
                      </div>
                      <div className="text-[11px] text-slate-400">
                        রেফারেল লিংকের মাধ্যমে ভিজিট
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatBnNumber(previewClicks)}
                  </div>
                  <div className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    রিয়েল-টাইম ট্র্যাকিং
                  </div>
                </div>

                {/* Preview Image 2: Conversion Card */}
                <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-700">
                        কনভার্সন পারফরম্যান্স
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ক্লিক থেকে সফল বিক্রয় হার
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatBnNumber(previewConversionRate)}%
                  </div>
                  <div className="inline-block text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    {formatBnNumber(previewConversions)} টি সেলস
                  </div>
                </div>

                {/* Preview Image 3: Revenue Ribbon Preview */}
                <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700">
                      রাজস্ব ও কমিশন প্রবাহ (৭ দিন)
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      সরাসরি গ্রাফে
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">টার্নওভার</span>
                      <span className="text-xs font-black text-slate-900 block truncate">{formatBDT(previewTurnover7d)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">পেআউট</span>
                      <span className="text-xs font-black text-indigo-600 block truncate">{formatBDT(previewPayout7d)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">অর্ডার</span>
                      <span className="text-xs font-black text-slate-900 block truncate">{formatBnNumber(previewOrders7d)} টি</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Image 4: Top Courses Breakdown Dynamic Preview */}
              <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>ছবি ৪: শীর্ষ কোর্স সেলস (ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে গণনা করা)</span>
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                    স্বয়ংক্রিয় ডাটাবেজ ডাইনামিক
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(analyticsData?.topCourses || []).map((course, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="truncate">#{idx + 1} {course.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                        <span>{formatBDT(course.revenue)}</span>
                        <span>{formatBnNumber(course.sales)} সেলস</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            পরিবর্তনগুলো সংরক্ষিত হলে সরাসরি হোমপেজে কার্যকর হবে।
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>প্রিভিউ দেখুন</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-red-600/30 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
