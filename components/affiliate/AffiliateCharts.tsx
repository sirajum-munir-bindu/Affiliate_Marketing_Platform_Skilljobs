"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, BarChart3, ArrowUpRight, Award, ExternalLink } from "lucide-react";
import { MockAffiliateClick, MockCommission, MockCourse } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";

interface AffiliateChartsProps {
  totalClicks: number;
  totalConversions: number;
  lifetimeEarnings: number;
  courses: MockCourse[];
  referralCode: string;
  clicks: MockAffiliateClick[];
  commissions: MockCommission[];
}

const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

function toLocalDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AffiliateCharts({
  totalClicks,
  totalConversions,
  lifetimeEarnings,
  courses,
  referralCode,
  clicks,
  commissions,
}: AffiliateChartsProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "year">("7d");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const datasets = useMemo(() => {
    const now = new Date();
    const activeCommissions = commissions.filter((c) => c.status !== "REVERSED");

    // 1. Last 7 days (daily buckets)
    const dayBuckets = Array.from({ length: 7 }, (_, idx) => {
      const dt = new Date(now);
      dt.setHours(0, 0, 0, 0);
      dt.setDate(dt.getDate() - (6 - idx));
      return {
        key: toLocalDayKey(dt),
        label: idx === 6 ? "আজ" : WEEKDAYS_BN[dt.getDay()],
        earnings: 0,
        clicks: 0,
        sales: 0,
      };
    });
    const dayMap = new Map(dayBuckets.map((b) => [b.key, b]));

    for (const clk of clicks) {
      const key = toLocalDayKey(new Date(clk.createdAt));
      const bucket = dayMap.get(key);
      if (bucket) bucket.clicks += 1;
    }
    for (const com of activeCommissions) {
      const key = toLocalDayKey(new Date(com.createdAt));
      const bucket = dayMap.get(key);
      if (bucket) {
        bucket.earnings += com.amount;
        bucket.sales += 1;
      }
    }

    // 2. Last 30 days (4 weekly buckets)
    const weekBuckets = [
      { label: "সপ্তাহ ১", minDays: 21, maxDays: 30, earnings: 0, clicks: 0, sales: 0 },
      { label: "সপ্তাহ ২", minDays: 14, maxDays: 21, earnings: 0, clicks: 0, sales: 0 },
      { label: "সপ্তাহ ৩", minDays: 7, maxDays: 14, earnings: 0, clicks: 0, sales: 0 },
      { label: "সপ্তাহ ৪", minDays: 0, maxDays: 7, earnings: 0, clicks: 0, sales: 0 },
    ];
    const nowMs = now.getTime();
    const DAY_MS = 86400000;

    for (const clk of clicks) {
      const ageDays = (nowMs - new Date(clk.createdAt).getTime()) / DAY_MS;
      if (ageDays >= 0 && ageDays <= 30) {
        const target =
          weekBuckets.find((w) => ageDays >= w.minDays && ageDays < w.maxDays) ||
          weekBuckets[0];
        target.clicks += 1;
      }
    }
    for (const com of activeCommissions) {
      const ageDays = (nowMs - new Date(com.createdAt).getTime()) / DAY_MS;
      if (ageDays >= 0 && ageDays <= 30) {
        const target =
          weekBuckets.find((w) => ageDays >= w.minDays && ageDays < w.maxDays) ||
          weekBuckets[0];
        target.earnings += com.amount;
        target.sales += 1;
      }
    }

    // 3. Current year (4 quarters)
    const currentYear = now.getFullYear();
    const quarterBuckets = [
      { label: "জানু-মার্চ", earnings: 0, clicks: 0, sales: 0 },
      { label: "এপ্রিল-জুন", earnings: 0, clicks: 0, sales: 0 },
      { label: "জুলাই-সেপ্টে", earnings: 0, clicks: 0, sales: 0 },
      { label: "অক্টো-ডিসে", earnings: 0, clicks: 0, sales: 0 },
    ];
    for (const clk of clicks) {
      const d = new Date(clk.createdAt);
      if (d.getFullYear() === currentYear) {
        quarterBuckets[Math.floor(d.getMonth() / 3)].clicks += 1;
      }
    }
    for (const com of activeCommissions) {
      const d = new Date(com.createdAt);
      if (d.getFullYear() === currentYear) {
        const q = quarterBuckets[Math.floor(d.getMonth() / 3)];
        q.earnings += com.amount;
        q.sales += 1;
      }
    }

    const clicks7d = dayBuckets.reduce((s, b) => s + b.clicks, 0);
    const earnings7d = dayBuckets.reduce((s, b) => s + b.earnings, 0);
    const sales7d = dayBuckets.reduce((s, b) => s + b.sales, 0);

    const clicks30d = weekBuckets.reduce((s, b) => s + b.clicks, 0);
    const earnings30d = weekBuckets.reduce((s, b) => s + b.earnings, 0);
    const sales30d = weekBuckets.reduce((s, b) => s + b.sales, 0);

    const clicksYear = quarterBuckets.reduce((s, b) => s + b.clicks, 0);
    const earningsYear = quarterBuckets.reduce((s, b) => s + b.earnings, 0);
    const salesYear = quarterBuckets.reduce((s, b) => s + b.sales, 0);

    return {
      "7d": {
        summaryEarnings: earnings7d,
        summaryClicks: clicks7d,
        summaryConversions: sales7d,
        points: dayBuckets,
      },
      "30d": {
        summaryEarnings: Math.max(earnings30d, lifetimeEarnings),
        summaryClicks: Math.max(clicks30d, totalClicks),
        summaryConversions: Math.max(sales30d, totalConversions),
        points: weekBuckets,
      },
      year: {
        summaryEarnings: Math.max(earningsYear, lifetimeEarnings),
        summaryClicks: Math.max(clicksYear, totalClicks),
        summaryConversions: Math.max(salesYear, totalConversions),
        points: quarterBuckets,
      },
    };
  }, [clicks, commissions, totalClicks, totalConversions, lifetimeEarnings]);

  const currentData = datasets[timeframe];
  const maxEarnings = Math.max(...currentData.points.map((p) => p.earnings)) * 1.18 || 1;
  const maxClicksScaled = Math.max(...currentData.points.map((p) => p.clicks)) * 1.18 || 1;

  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const pointsCount = currentData.points.length;
  const coords = currentData.points.map((pt, i) => {
    const x = paddingX + (i / (pointsCount - 1)) * chartWidth;
    const yEarnings = svgHeight - paddingY - (pt.earnings / maxEarnings) * chartHeight;
    const yClicks = svgHeight - paddingY - ((pt.clicks / maxClicksScaled) * chartHeight * 0.78);
    return { ...pt, x, yEarnings, yClicks, index: i };
  });

  const earningsLinePath = coords.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.yEarnings}`,
    ""
  );
  const earningsAreaPath = `${earningsLinePath} L ${coords[coords.length - 1].x} ${
    svgHeight - paddingY
  } L ${coords[0].x} ${svgHeight - paddingY} Z`;

  const clicksLinePath = coords.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.yClicks}`,
    ""
  );
  const clicksAreaPath = `${clicksLinePath} L ${coords[coords.length - 1].x} ${
    svgHeight - paddingY
  } L ${coords[0].x} ${svgHeight - paddingY} Z`;

  const promoCourses = [...courses]
    .filter((c) => c.isAffiliateEligible)
    .sort((a, b) => (b.price * b.commissionRate) - (a.price * a.commissionRate))
    .slice(0, 4);

  const maxPerSaleCommission =
    promoCourses.length > 0
      ? Math.max(...promoCourses.map((c) => (c.price * c.commissionRate) / 100))
      : 1;

  const barColors = [
    "from-emerald-500 to-teal-600",
    "from-blue-600 to-indigo-600",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-red-600",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Earnings & Traffic Area Chart */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  আর্নিং ও ট্র্যাফিক প্রবাহ অ্যানালিটিক্স
                </h3>
                <p className="text-xs text-slate-500">
                  রেফারেল ক্লিক এবং অর্জিত কমিশনের তুলনামূলক পারফরম্যান্স গ্রাফ
                </p>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold text-slate-600">
              {(
                [
                  { id: "7d", label: "গত ৭ দিন" },
                  { id: "30d", label: "৩০ দিন" },
                  { id: "year", label: "চলতি বছর" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTimeframe(t.id);
                    setHoveredPoint(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    timeframe === t.id
                      ? "bg-white text-slate-900 shadow-xs font-black"
                      : "hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                সম্ভাব্য / অর্জিত আয়
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatBDT(currentData.summaryEarnings)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> সক্রিয় গ্রোথ
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                রেফারেল ভিজিটর
              </span>
              <span className="text-base sm:text-lg font-black text-indigo-600">
                {formatBnNumber(currentData.summaryClicks)} ক্লিক
              </span>
              <span className="text-[10px] font-bold text-indigo-600 mt-0.5 block">
                ৩০-দিনের কুকি উইন্ডো
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                সফল কনভার্সন
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatBnNumber(currentData.summaryConversions)} টি সেল
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                লাস্ট-ক্লিক অ্যাট্রিবিউশন
              </span>
            </div>
          </div>

          <div className="relative w-full h-[220px] select-none">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="affEarnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="affClickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                const y = svgHeight - paddingY - ratio * chartHeight;
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              <path d={earningsAreaPath} fill="url(#affEarnGrad)" />
              <path
                d={earningsLinePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path d={clicksAreaPath} fill="url(#affClickGrad)" />
              <path
                d={clicksLinePath}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {coords.map((pt) => {
                const isHovered = hoveredPoint === pt.index;
                return (
                  <g key={pt.index}>
                    <circle
                      cx={pt.x}
                      cy={pt.yEarnings}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#10B981"
                      strokeWidth={isHovered ? 3 : 2}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.yClicks}
                      r={isHovered ? 5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#6366F1"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                    />
                    <text
                      x={pt.x}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      className={`text-[11px] font-bold ${
                        isHovered ? "fill-slate-900 font-black" : "fill-slate-400"
                      }`}
                    >
                      {pt.label}
                    </text>
                    <rect
                      x={pt.x - 25}
                      y={0}
                      width={50}
                      height={svgHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt.index)}
                    />
                  </g>
                );
              })}
            </svg>

            {hoveredPoint !== null && coords[hoveredPoint] && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-700 -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(coords[hoveredPoint].x / svgWidth) * 100}%`,
                  top: `${(coords[hoveredPoint].yEarnings / svgHeight) * 100}%`,
                  marginTop: "-12px",
                }}
              >
                <p className="font-extrabold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                  <span>{coords[hoveredPoint].label}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatBnNumber(coords[hoveredPoint].sales)} টি সেল
                  </span>
                </p>
                <p className="text-emerald-400 font-bold flex items-center justify-between gap-4">
                  <span>কমিশন আয়:</span>
                  <span>{formatBDT(coords[hoveredPoint].earnings)}</span>
                </p>
                <p className="text-indigo-300 font-bold flex items-center justify-between gap-4">
                  <span>রেফারেল ক্লিক:</span>
                  <span>{formatBnNumber(coords[hoveredPoint].clicks)}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" />
            <span>অর্জিত কমিশন (Earnings)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-2xs" />
            <span>রেফারেল ক্লিক (Clicks)</span>
          </div>
        </div>
      </div>

      {/* Top High-Commission Courses to Promote */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  সর্বোচ্চ কমিশনধারী কোর্স
                </h3>
                <p className="text-xs text-slate-500">প্রতি সেলে সর্বোচ্চ আয়</p>
              </div>
            </div>
            <Link
              href="/affiliate/links"
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
            >
              <span>সব লিংক</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4 mt-4">
            {promoCourses.map((course, idx) => {
              const comm = Math.round((course.price * course.commissionRate) / 100);
              const pct = Math.max(20, Math.round((comm / maxPerSaleCommission) * 100));
              return (
                <div key={course.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <Link
                        href={`/courses/${course.slug}?ref=${referralCode}`}
                        target="_blank"
                        prefetch={false}
                        className="font-black text-slate-800 hover:text-blue-600 truncate"
                      >
                        {course.titleBn}
                      </Link>
                    </div>
                    <span className="font-extrabold text-emerald-600 shrink-0 ml-2">
                      +{formatBDT(comm)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          barColors[idx % barColors.length]
                        } transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">
                      {course.commissionRate}% কমিশন
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/80 rounded-2xl mt-5">
          <div className="flex items-center gap-2 text-xs font-black text-blue-900">
            <Award className="w-4 h-4 text-blue-600" />
            <span>প্রো টিপস: হাই-কমিশন কোর্স প্রমোট করুন</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            আপনার রেফারেল কোড <strong className="font-mono">{referralCode}</strong> যুক্ত লিংক শেয়ার করলে ৩০ দিন পর্যন্ত অ্যাট্রিবিউশন সুরক্ষিত থাকে।
          </p>
        </div>
      </div>
    </div>
  );
}
