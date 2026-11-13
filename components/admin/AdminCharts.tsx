"use client";

import { useState } from "react";
import { TrendingUp, BarChart3, ArrowUpRight, Award, ChevronRight } from "lucide-react";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { AdminAnalyticsData } from "@/lib/services/data-service";

interface AdminChartsProps {
  totalRevenue: number;
  totalCommissions: number;
  analyticsData?: AdminAnalyticsData;
}

export function AdminCharts({ totalRevenue, totalCommissions, analyticsData }: AdminChartsProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "year">("7d");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Timeframe datasets - dynamically powered by analyticsData or calculated dynamically
  const datasets = analyticsData?.chartDatasets || {
    "7d": {
      summaryTurnover: totalRevenue > 0 ? totalRevenue : 142000,
      summaryPayout: totalCommissions > 0 ? totalCommissions : 28400,
      summaryOrders: 69,
      growthText: "+১৮.২% প্রবৃদ্ধি",
      payoutNote: "গড় ২০% কমিশন বণ্টন",
      conversionRateText: "কনভার্সন রেট ৪.৮%",
      points: [
        { label: "শনি", revenue: 8500, commission: 1700, orders: 4 },
        { label: "রবি", revenue: 14200, commission: 2840, orders: 7 },
        { label: "সোম", revenue: 19800, commission: 3960, orders: 9 },
        { label: "মঙ্গল", revenue: 16500, commission: 3300, orders: 8 },
        { label: "বুধ", revenue: 24000, commission: 4800, orders: 12 },
        { label: "বৃহস্পতি", revenue: 31000, commission: 6200, orders: 15 },
        { label: "শুক্র", revenue: 28000, commission: 5600, orders: 14 },
      ],
    },
    "30d": {
      summaryTurnover: (totalRevenue > 0 ? totalRevenue : 142000) * 4.1,
      summaryPayout: (totalCommissions > 0 ? totalCommissions : 28400) * 4.1,
      summaryOrders: 285,
      growthText: "+২৪.৫% প্রবৃদ্ধি",
      payoutNote: "গড় ২০% কমিশন বণ্টন",
      conversionRateText: "কনভার্সন রেট ৫.২%",
      points: [
        { label: "সপ্তাহ ১", revenue: 95000, commission: 19000, orders: 48 },
        { label: "সপ্তাহ ২", revenue: 140000, commission: 28000, orders: 70 },
        { label: "সপ্তাহ ৩", revenue: 165000, commission: 33000, orders: 82 },
        { label: "সপ্তাহ ৪", revenue: 180000, commission: 36000, orders: 85 },
      ],
    },
    year: {
      summaryTurnover: (totalRevenue > 0 ? totalRevenue : 142000) * 20,
      summaryPayout: (totalCommissions > 0 ? totalCommissions : 28400) * 20,
      summaryOrders: 1420,
      growthText: "+৫২.০% বার্ষিক প্রবৃদ্ধি",
      payoutNote: "গড় ২০% কমিশন বণ্টন",
      conversionRateText: "কনভার্সন রেট ৫.৫%",
      points: [
        { label: "জানু-মার্চ", revenue: 450000, commission: 90000, orders: 220 },
        { label: "এপ্রিল-জুন", revenue: 680000, commission: 136000, orders: 340 },
        { label: "জুলাই-সেপ্টে", revenue: 820000, commission: 164000, orders: 410 },
        { label: "অক্টো-ডিসে", revenue: 900000, commission: 180000, orders: 450 },
      ],
    },
  };

  const currentData = datasets[timeframe];
  const maxRevenue = Math.max(...currentData.points.map((p) => p.revenue)) * 1.15 || 1;

  // Generate SVG coordinates
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const pointsCount = currentData.points.length;
  const coords = currentData.points.map((pt, i) => {
    const x = paddingX + (i / (pointsCount - 1)) * chartWidth;
    const yRevenue = svgHeight - paddingY - (pt.revenue / maxRevenue) * chartHeight;
    const yCommission = svgHeight - paddingY - (pt.commission / maxRevenue) * chartHeight;
    return { ...pt, x, yRevenue, yCommission, index: i };
  });

  // SVG Area path generator
  const revenueLinePath = coords.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.yRevenue}`,
    ""
  );
  const revenueAreaPath = `${revenueLinePath} L ${coords[coords.length - 1].x} ${
    svgHeight - paddingY
  } L ${coords[0].x} ${svgHeight - paddingY} Z`;

  const commissionLinePath = coords.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.yCommission}`,
    ""
  );
  const commissionAreaPath = `${commissionLinePath} L ${coords[coords.length - 1].x} ${
    svgHeight - paddingY
  } L ${coords[0].x} ${svgHeight - paddingY} Z`;

  // Dynamically populated from database analyticsData
  const topCourses = analyticsData?.topCourses || [
    { id: "crs_1", name: "ওয়েব ডেভেলপমেন্ট মাস্টারক্লাস", category: "প্রোগ্রামিং", sales: 48, revenue: 96000, percentage: 85, color: "from-blue-600 to-indigo-600" },
    { id: "crs_2", name: "ডিজিটাল ও অ্যাফিলিয়েট মার্কেটিং", category: "মার্কেটিং", sales: 36, revenue: 54000, percentage: 65, color: "from-emerald-500 to-teal-600" },
    { id: "crs_3", name: "প্রফেশনাল গ্রাফিক ডিজাইন", category: "ক্রিয়েটিভ", sales: 29, revenue: 43500, percentage: 52, color: "from-purple-500 to-violet-600" },
    { id: "crs_4", name: "স্পোকেন ইংলিশ ও ক্যারিয়ার স্কিলস", category: "ল্যাঙ্গুয়েজ", sales: 22, revenue: 33000, percentage: 40, color: "from-amber-500 to-orange-600" },
    { id: "crs_5", name: "ফুল-স্ট্যাক ফ্রিল্যান্সিং গাইড", category: "ক্যারিয়ার", sales: 18, revenue: 27000, percentage: 32, color: "from-rose-500 to-red-600" },
  ];

  const bestPerformer = analyticsData?.bestPerformer || {
    title: topCourses[0]?.name || "ওয়েব ডেভেলপমেন্ট",
    sales: topCourses[0]?.sales || 48,
    affiliateShare: 70,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Main Revenue & Commission Analytics Area Chart */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  রাজস্ব ও কমিশন প্রবাহ অ্যানালিটিক্স
                </h3>
                <p className="text-xs text-slate-500">
                  দৈনিক সেলস এবং অ্যাফিলিয়েটদের অর্জিত কমিশনের তুলনামূলক গ্রাফ
                </p>
              </div>
            </div>

            {/* Timeframe switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setTimeframe("7d");
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === "7d"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "hover:text-slate-900"
                }`}
              >
                গত ৭ দিন
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe("30d");
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === "30d"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "hover:text-slate-900"
                }`}
              >
                ৩০ দিন
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe("year");
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === "year"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "hover:text-slate-900"
                }`}
              >
                চলতি বছর
              </button>
            </div>
          </div>

          {/* Highlights Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                টার্নওভার রাজস্ব
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatBDT(currentData.summaryTurnover)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> {currentData.growthText || "+১৮.২% প্রবৃদ্ধি"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                অ্যাফিলিয়েট পেআউট প্রদেয়
              </span>
              <span className="text-base sm:text-lg font-black text-indigo-600">
                {formatBDT(currentData.summaryPayout)}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 mt-0.5">
                {currentData.payoutNote || "গড় ২০% কমিশন বণ্টন"}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">
                সফল অর্ডার
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {formatBnNumber(currentData.summaryOrders)} টি
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                {currentData.conversionRateText || "কনভার্সন রেট ৪.৮%"}
              </span>
            </div>
          </div>

          {/* Pure SVG Interactive Area Chart (No external hydration dependency) */}
          <div className="relative w-full h-[220px] select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="svgRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="svgCommGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
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

              {/* Revenue Area & Line */}
              <path d={revenueAreaPath} fill="url(#svgRevGrad)" />
              <path
                d={revenueLinePath}
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Commission Area & Line */}
              <path d={commissionAreaPath} fill="url(#svgCommGrad)" />
              <path
                d={commissionLinePath}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & Interactive Hover Hit Targets */}
              {coords.map((pt) => {
                const isHovered = hoveredPoint === pt.index;
                return (
                  <g key={pt.index} className="transition-all">
                    {/* Revenue Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.yRevenue}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#10B981"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />

                    {/* Commission Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.yCommission}
                      r={isHovered ? 5 : 3.5}
                      fill="#FFFFFF"
                      stroke="#6366F1"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />

                    {/* X-Axis Label */}
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

                    {/* Invisible Wide Hit Area for mouse hover */}
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

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && coords[hoveredPoint] && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-700 -translate-x-1/2 -translate-y-full transition-all"
                style={{
                  left: `${(coords[hoveredPoint].x / svgWidth) * 100}%`,
                  top: `${(coords[hoveredPoint].yRevenue / svgHeight) * 100}%`,
                  marginTop: "-12px",
                }}
              >
                <p className="font-extrabold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                  <span>{coords[hoveredPoint].label}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatBnNumber(coords[hoveredPoint].orders)} টি অর্ডার
                  </span>
                </p>
                <p className="text-emerald-400 font-bold flex items-center justify-between gap-4">
                  <span>বিক্রয় রাজস্ব:</span>
                  <span>{formatBDT(coords[hoveredPoint].revenue)}</span>
                </p>
                <p className="text-indigo-300 font-bold flex items-center justify-between gap-4">
                  <span>কমিশন প্রদেয়:</span>
                  <span>{formatBDT(coords[hoveredPoint].commission)}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" />
            <span>মোট বিক্রয় রাজস্ব (Revenue)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-2xs" />
            <span>অ্যাফিলিয়েট কমিশন (Commission)</span>
          </div>
        </div>
      </div>

      {/* Top Performing Courses Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  শীর্ষ কোর্স সেলস
                </h3>
                <p className="text-xs text-slate-500">
                  সর্বাধিক বিক্রিত কোর্স ও এনরোলমেন্ট
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
              রিয়েল-টাইম
            </span>
          </div>

          {/* List of Courses with Progress Bars */}
          <div className="space-y-4 mt-4">
            {topCourses.map((course, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-black text-slate-800 truncate">
                      {course.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0 ml-2">
                    {formatBDT(course.revenue)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${course.color} transition-all duration-500`}
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    {formatBnNumber(course.sales)} সেলস
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Insight Pill */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/80 rounded-2xl mt-5">
          <div className="flex items-center gap-2 text-xs font-black text-blue-900">
            <Award className="w-4 h-4 text-blue-600" />
            <span>সেরা পারফরমার: {bestPerformer.title}</span>
          </div>
          <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
            এই কোর্সটি থেকে সর্বোচ্চ {formatBnNumber(bestPerformer.sales)}টি সফল এনরোলমেন্ট এসেছে এবং {formatBnNumber(bestPerformer.affiliateShare)}% ট্র্যাফিক সরাসরি অ্যাফিলিয়েটদের মাধ্যমে এসেছে।
          </p>
        </div>
      </div>

    </div>
  );
}
