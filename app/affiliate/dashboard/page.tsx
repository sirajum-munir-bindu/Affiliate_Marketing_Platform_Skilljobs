import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { AffiliateCharts } from "@/components/affiliate/AffiliateCharts";
import {
  MousePointerClick,
  TrendingUp,
  Wallet,
  Coins,
  Link as LinkIcon,
  CreditCard,
  Clock,
  CheckCircle2,
  ChevronRight,
  Award,
  Globe
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AffiliateDashboardPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const [courses, commissions, payouts, clicks] = await Promise.all([
    DataService.getCourses(true),
    DataService.getMarketerCommissions(marketer?.id || ""),
    DataService.getMarketerPayouts(marketer?.id || ""),
    DataService.getMarketerClicks(marketer?.id || ""),
  ]);

  const referralCode = marketer?.referralCode || session?.referralCode || "AFF2026";
  const conversionRate =
    marketer && marketer.totalClicks > 0
      ? ((marketer.totalConversions / marketer.totalClicks) * 100).toFixed(1)
      : "0.0";

  const statCards = [
    {
      label: "উত্তোলনযোগ্য ব্যালেন্স",
      subLabel: "bKash / নগদ / ব্যাংকে উত্তোলনযোগ্য",
      value: formatBDT(marketer?.currentBalance || 0),
      trend: (marketer?.currentBalance || 0) >= 500 ? "উত্তোলন প্রস্তুত" : "ন্যূনতম ৳৫০০",
      trendPositive: (marketer?.currentBalance || 0) >= 500,
      icon: Wallet,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "hover:border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600",
      link: "/affiliate/payouts",
    },
    {
      label: "মোট লাইফটাইম আয়",
      subLabel: "সর্বমোট অর্জিত অ্যাফিলিয়েট কমিশন",
      value: formatBDT(marketer?.lifetimeEarnings || 0),
      trend: `উত্তোলিত: ${formatBDT(marketer?.paidEarnings || 0)}`,
      trendPositive: true,
      icon: Coins,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: "hover:border-blue-200",
      iconBg: "bg-blue-50 text-blue-600",
      link: "/affiliate/commissions",
    },
    {
      label: "মোট রেফারেল ক্লিক",
      subLabel: "আপনার লিংকের মাধ্যমে মোট ভিজিটর",
      value: formatBnNumber(marketer?.totalClicks || 0),
      trend: "রিয়েল-টাইম ট্র্যাকিং",
      trendPositive: true,
      icon: MousePointerClick,
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      borderColor: "hover:border-purple-200",
      iconBg: "bg-purple-50 text-purple-600",
      link: "#click-history",
    },
    {
      label: "সফল কনভার্সন ও হার",
      subLabel: "ক্লিক থেকে সফল কোর্স এনরোলমেন্ট",
      value: `${formatBnNumber(marketer?.totalConversions || 0)} টি`,
      trend: `${formatBnNumber(conversionRate)}% কনভার্সন`,
      trendPositive: true,
      icon: TrendingUp,
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "hover:border-rose-200",
      iconBg: "bg-rose-50 text-rose-600",
      link: "#click-history",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Dark Hero Banner (Matching Admin Dashboard) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#111C35] to-[#0B1120] border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ভেরিফাইড পার্টনার • কোড: {referralCode}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              স্বাগতম, {session?.name || "মার্কেটার"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              আপনার রেফারেল লিংক শেয়ার করুন, রিয়েল-টাইম ক্লিক ও কনভার্সন ট্র্যাক করুন এবং প্রতিটি সফল বিক্রয়ে তাৎক্ষণিক কমিশন অর্জন করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/affiliate/links"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black transition-all shadow-md hover:scale-[1.02]"
            >
              <LinkIcon className="w-4 h-4 text-red-600" />
              <span>রেফারেল লিংকসমূহ</span>
            </Link>

            <Link
              href="/affiliate/payouts"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/30 hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>টাকা উত্তোলন করুন</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern High-Impact KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              আপনার পারফরম্যান্স ও আর্নিং সূচক (KPIs)
            </h2>
            <p className="text-xs text-slate-500">
              লাইভ ব্যালেন্স, রেফারেল ট্র্যাফিক এবং কনভার্সন মেট্রিক্স
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full hidden sm:inline-block">
            স্বয়ংক্রিয় আপডেট
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`group relative bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${card.borderColor}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-600 leading-tight">
                      {card.label}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {card.value}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{card.subLabel}</p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      card.trendPositive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {card.trend}
                  </span>

                  <Link
                    href={card.link}
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>বিস্তারিত</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Analytics Charts */}
      <AffiliateCharts
        totalClicks={marketer?.totalClicks || 0}
        totalConversions={marketer?.totalConversions || 0}
        lifetimeEarnings={marketer?.lifetimeEarnings || 0}
        courses={courses}
        referralCode={referralCode}
        clicks={clicks}
        commissions={commissions}
      />

      {/* Split Dual Panels: Recent Commissions & Recent Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Commissions */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    সাম্প্রতিক অর্জিত কমিশন
                  </h3>
                  <p className="text-xs text-slate-500">আপনার রেফারেল সেলের লাইভ লেজার</p>
                </div>
              </div>

              <Link
                href="/affiliate/commissions"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>সব দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {commissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">এখনও কোনো কমিশন রেকর্ড হয়নি</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  রেফারেল লিংক শেয়ার করে প্রথম সেল সম্পন্ন করুন!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {commissions.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="py-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">
                          {c.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {c.rate}%
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium truncate mt-0.5">
                        {c.courseTitleBn}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-emerald-600 text-sm block">
                        +{formatBDT(c.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          c.status === "REVERSED"
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    পে-আউট ও উত্তোলন হিস্ট্রি
                  </h3>
                  <p className="text-xs text-slate-500">bKash, Nagad ও ব্যাংক ট্রান্সফার</p>
                </div>
              </div>

              <Link
                href="/affiliate/payouts"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>উত্তোলন করুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {payouts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">কোনো পে-আউট আবেদন নেই</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ন্যূনতম ৳৫০০ হলেই উত্তোলন রিকোয়েস্ট পাঠাতে পারবেন।
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {payouts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="py-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {p.payoutNumber}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {p.method}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {p.destinationNumber}
                        {p.transactionReference ? ` • Ref: ${p.transactionReference}` : ""}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatBDT(p.amount)}
                      </span>
                      {p.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> পরিশোধিত
                        </span>
                      ) : p.status === "REJECTED" ? (
                        <span className="text-[10px] font-bold text-rose-600">বাতিলকৃত</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                          <Clock className="w-3 h-3" /> অপেক্ষমান
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click & Sales Analytics - Click History Log */}
      <div
        id="click-history"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                ক্লিক ও সেলস অ্যানালিটিক্স (সর্বশেষ ক্লিক হিস্ট্রি)
              </h3>
              <p className="text-xs text-slate-500">
                আপনার রেফারেল লিংকে ভিজিটরদের রিয়েল-টাইম ক্লিক লগ
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full shrink-0">
            {formatBnNumber(clicks.length)} টি লগ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">ল্যান্ডিং পেজ</th>
                <th className="py-3.5 px-4">ডিভাইস / মাধ্যম</th>
                <th className="py-3.5 px-6 text-right">ক্লিকের সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {clicks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400">
                    কোনো সাম্প্রতিক ক্লিক লগ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                clicks.slice(0, 20).map((clk) => (
                  <tr key={clk.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-mono font-bold text-[#2563EB]">{clk.landingPage}</p>
                      {clk.courseTitleBn && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[320px]">
                          {clk.courseTitleBn}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {clk.referer || "ডিরেক্ট ভিজিট"} • {clk.deviceType || "ওয়েব ব্রাউজার"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-500">
                      {new Date(clk.createdAt).toLocaleString("bn-BD")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
