import { DataService } from "@/lib/services/data-service";
import { mockDb } from "@/lib/db/mock-data";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { AdminCharts } from "@/components/admin/AdminCharts";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  Clock,
  Users,
  MousePointerClick,
  TrendingUp,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  Server,
  Lock,
  Zap,
  GraduationCap,
  UserCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await DataService.getAdminOverviewStats();
  const applications = await DataService.getAffiliateApplications();
  const pendingApps = applications.filter((a) => a.status === "PENDING");

  const pendingPayments = mockDb.payments
    .filter((p) => p.status === "SUBMITTED")
    .slice(0, 5);

  const conversionRate =
    stats.totalClicks > 0
      ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(1)
      : "0";

  const statCards = [
    {
      label: "মোট সফল রাজস্ব",
      subLabel: "প্ল্যাটফর্মের মোট কোর্স সেলস",
      value: formatBDT(stats.totalRevenue),
      trend: "+১৮.৪% মাসিক",
      trendPositive: true,
      icon: Banknote,
      color: "text-emerald-500",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "hover:border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "পেন্ডিং bKash পেমেন্ট",
      subLabel: "ভেরিফিকেশনের অপেক্ষায়",
      value: `${formatBnNumber(stats.pendingPaymentsCount)} টি`,
      trend: stats.pendingPaymentsCount > 0 ? "জরুরি অ্যাকশন" : "সব ভেরিফায়েড",
      trendPositive: stats.pendingPaymentsCount === 0,
      alert: stats.pendingPaymentsCount > 0,
      icon: Clock,
      color: "text-rose-500",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "hover:border-rose-200",
      iconBg: "bg-rose-50 text-rose-600",
      link: "/admin/payments",
    },
    {
      label: "নতুন অ্যাফিলিয়েট আবেদন",
      subLabel: "মার্কেটার হিসেবে যোগদান",
      value: `${formatBnNumber(stats.pendingApplicationsCount)} টি`,
      trend: "রিভিউ প্রয়োজন",
      trendPositive: true,
      alert: stats.pendingApplicationsCount > 0,
      icon: UserCheck,
      color: "text-blue-500",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: "hover:border-blue-200",
      iconBg: "bg-blue-50 text-blue-600",
      link: "/admin/applications",
    },
    {
      label: "উত্তোলন (Payout) রিকোয়েস্ট",
      subLabel: "অ্যাফিলিয়েটদের প্রদেয় ব্যালেন্স",
      value: `${formatBnNumber(stats.pendingPayoutsCount)} টি`,
      trend: "bKash / ব্যাংক",
      trendPositive: true,
      icon: CreditCard,
      color: "text-amber-500",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "hover:border-amber-200",
      iconBg: "bg-amber-50 text-amber-600",
      link: "/admin/payouts",
    },
    {
      label: "মোট সফল কোর্স অর্ডার",
      subLabel: "কোর্স এনরোলমেন্ট সংখ্যা",
      value: `${formatBnNumber(stats.totalOrders)} টি`,
      trend: "সক্রিয় শিক্ষার্থী",
      trendPositive: true,
      icon: ShoppingBag,
      color: "text-indigo-500",
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderColor: "hover:border-indigo-200",
      iconBg: "bg-indigo-50 text-indigo-600",
      link: "/admin/orders",
    },
    {
      label: "সক্রিয় অনুমোদিত মার্কেটার",
      subLabel: "ভেরিফায়েড পার্টনার নেটওয়ার্ক",
      value: `${formatBnNumber(stats.activeMarketersCount)} জন`,
      trend: "+১২ নতুন এই মাসে",
      trendPositive: true,
      icon: GraduationCap,
      color: "text-purple-500",
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      borderColor: "hover:border-purple-200",
      iconBg: "bg-purple-50 text-purple-600",
      link: "/admin/marketers",
    },
    {
      label: "অ্যাফিলিয়েট ট্র্যাফিক ক্লিক",
      subLabel: "রেফারেল লিংকের মাধ্যমে ভিজিট",
      value: formatBnNumber(stats.totalClicks),
      trend: "রিয়েল-টাইম ট্র্যাকিং",
      trendPositive: true,
      icon: MousePointerClick,
      color: "text-sky-500",
      gradient: "from-sky-500/10 via-sky-500/5 to-transparent",
      borderColor: "hover:border-sky-200",
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      label: "কনভার্সন পারফরম্যান্স",
      subLabel: "ক্লিক থেকে সফল বিক্রয় হার",
      value: `${formatBnNumber(conversionRate)}%`,
      trend: `${formatBnNumber(stats.totalConversions)} টি সেলস`,
      trendPositive: true,
      icon: TrendingUp,
      color: "text-teal-500",
      gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
      borderColor: "hover:border-teal-200",
      iconBg: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Modern Executive Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#111C35] to-[#0B1120] border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>এডমিন কন্ট্রোল সেন্টার • Skilljobs Affiliation</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              স্বাগতম, Super Admin
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              প্ল্যাটফর্মের সামগ্রিক পারফরম্যান্স, শিক্ষার্থী ভর্তি, bKash পেমেন্ট অনুমোদন এবং মার্কেটার কমিশন ট্র্যাকিং এখানে রিয়েল-টাইমে পর্যবেক্ষণ করুন।
            </p>
          </div>

          {/* Quick Action CTAs inside Hero */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black transition-all shadow-md hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-red-600" />
              <span>নতুন কোর্স যুক্ত করুন</span>
            </Link>

            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/30 hover:scale-[1.02]"
            >
              <Clock className="w-4 h-4" />
              <span>
                bKash পেমেন্ট ভেরিফাই{" "}
                {stats.pendingPaymentsCount > 0 && (
                  <span className="ml-1 bg-white text-red-700 px-1.5 py-0.2 rounded-full text-xs font-black">
                    {stats.pendingPaymentsCount}
                  </span>
                )}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 8 Modern High-Impact KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              প্ল্যাটফর্মের প্রধান পারফরম্যান্স সূচক (KPIs)
            </h2>
            <p className="text-xs text-slate-500">
              সর্বশেষ লাইভ ডাটাবেজ মেট্রিক্স এবং সেলস স্ট্যাটাস
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
                {/* Subtle gradient background highlight */}
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
                    <p className="text-[11px] text-slate-400 truncate">
                      {card.subLabel}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      card.alert
                        ? "bg-rose-100 text-rose-700 animate-pulse"
                        : card.trendPositive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {card.trend}
                  </span>

                  {card.link && (
                    <Link
                      href={card.link}
                      className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>বিস্তারিত</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Analytics Charts (Recharts Area & Bar) */}
      <AdminCharts
        totalRevenue={stats.totalRevenue}
        totalCommissions={stats.totalCommissionGenerated}
      />

      {/* Split Dual Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Queue 1: Pending bKash Payments */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    পেন্ডিং bKash পেমেন্ট ভেরিফিকেশন
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষার্থীদের প্রেরিত ট্রানজেকশন যাচাই করুন
                  </p>
                </div>
              </div>

              <Link
                href="/admin/payments"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>সবগুলো ({stats.pendingPaymentsCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-slate-700">সব পেমেন্ট ভেরিফাইড!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">নতুন কোনো অমীমাংসিত পেমেন্ট জমা নেই।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingPayments.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 truncate">
                          {item.customerName}
                        </span>
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 px-1.5 py-0.2 rounded">
                          TrxID: {item.transactionId}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">
                        {item.courseTitleBn} • {item.senderNumber}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="font-black text-emerald-600 text-sm block">
                          {formatBDT(item.amount)}
                        </span>
                      </div>
                      <Link
                        href="/admin/payments"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-[11px] transition-colors"
                      >
                        ভেরিফাই
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>পেমেন্ট অ্যাপ্রুভ করলে কোর্স স্বয়ংক্রিয়ভাবে আনলক হয়</span>
            <Link href="/admin/payments" className="font-bold text-red-600 hover:underline">
              ভেরিফিকেশন প্যানেল →
            </Link>
          </div>
        </div>

        {/* Queue 2: Pending Affiliate Applications */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    নতুন অ্যাফিলিয়েট আবেদন
                  </h3>
                  <p className="text-xs text-slate-500">
                    মার্কেটারদের আবেদন পর্যালোচনা ও অনুমোদন
                  </p>
                </div>
              </div>

              <Link
                href="/admin/applications"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>সবগুলো ({pendingApps.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingApps.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-blue-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-slate-700">কোনো পেন্ডিং আবেদন নেই</p>
                <p className="text-[11px] text-slate-400 mt-0.5">সব অ্যাফিলিয়েট আবেদন প্রসেস করা হয়েছে।</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingApps.slice(0, 4).map((app) => (
                  <div key={app.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 font-extrabold text-slate-700 text-xs flex items-center justify-center shrink-0">
                        {app.fullName.substring(0, 2)}
                      </div>
                      <div className="truncate">
                        <p className="font-black text-slate-800 truncate">
                          {app.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {app.phone} • {app.occupation || "মার্কেটার"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href="/admin/applications"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                      >
                        রিভিউ করুন
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>অনুমোদন দিলে স্বয়ংক্রিয় রেফারেল লিংক ও ড্যাশবোর্ড তৈরি হয়</span>
            <Link href="/admin/applications" className="font-bold text-blue-600 hover:underline">
              আবেদন তালিকা →
            </Link>
          </div>
        </div>

      </div>

      {/* Safety SOP & System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SOP Card 1 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-black text-sm text-slate-900">
                bKash মার্চেন্ট ভেরিফিকেশন
              </h4>
              <p className="text-[11px] text-slate-500">পেমেন্ট সুরক্ষা প্রোটোকল</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            bKash মেসেজের TrxID ও প্রেরকের নম্বর নিশ্চিত হয়ে "Approve" করুন। অনুমোদন দেওয়ার সাথে সাথেই স্টুডেন্ট কোর্সের অ্যাক্সেস পায় এবং অ্যাফিলিয়েট কমিশন জমা হয়।
          </p>
          <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            ডুপ্লিকেট TrxID স্বয়ংক্রিয়ভাবে ব্লক হয়
          </div>
        </div>

        {/* SOP Card 2 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-black text-sm text-slate-900">
                স্বয়ংক্রিয় ট্র্যাকিং ও অ্যাট্রিবিউশন
              </h4>
              <p className="text-[11px] text-slate-500">৩০ দিনের কুকি রুল</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            কোনো শিক্ষার্থী রেফারেল লিংকে ক্লিক করলে ৩০ দিন পর্যন্ত কুকি সক্রিয় থাকে। এই সময়ের মধ্যে অর্ডার করলে সংশ্লিষ্ট মার্কেটার স্বয়ংক্রিয়ভাবে কমিশন লাভ করে।
          </p>
          <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ফার্স্ট-ক্লিক / লাস্ট-ক্লিক সেফগার্ড সক্রিয়
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-black text-sm text-slate-900">
                সিস্টেম স্ট্যাটাস ও সিকিউরিটি
              </h4>
              <p className="text-[11px] text-slate-500">সার্ভার ও ডেটাবেজ হেলথ</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>PostgreSQL Database:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                সচল ও সংযুক্ত
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>JWT Authentication:</span>
              <span className="font-bold text-emerald-600">সুরক্ষিত</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit Logging:</span>
              <span className="font-bold text-emerald-600">অ্যাক্টিভ</span>
            </div>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-[11px] font-bold text-slate-700 hover:text-blue-600 flex items-center justify-between pt-1 border-t border-slate-100"
          >
            <span>নিরাপত্তা লগ পর্যালোচনা</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
