import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
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
  CheckCircle2
} from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await DataService.getAdminOverviewStats();
  const applications = await DataService.getAffiliateApplications();
  const pendingApps = applications.filter((a) => a.status === "PENDING");
  const pendingPayments = (await DataService.getStudentDashboardData("all")).payments?.filter(
    (p: any) => p.status === "SUBMITTED"
  ) || [];

  const statCards = [
    {
      label: "মোট সফল রাজস্ব (Revenue)",
      value: formatBDT(stats.totalRevenue),
      icon: Banknote,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50",
    },
    {
      label: "পেন্ডিং bKash পেমেন্ট",
      value: `${formatBnNumber(stats.pendingPaymentsCount)} টি অপেক্ষা করছে`,
      icon: Clock,
      color: "text-[#E53945]",
      bg: "bg-red-50",
      alert: stats.pendingPaymentsCount > 0,
      link: "/admin/payments",
    },
    {
      label: "নতুন অ্যাফিলিয়েট আবেদন",
      value: `${formatBnNumber(stats.pendingApplicationsCount)} টি নতুন আবেদন`,
      icon: Users,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
      alert: stats.pendingApplicationsCount > 0,
      link: "/admin/applications",
    },
    {
      label: "পেন্ডিং পে-আউট রিকোয়েস্ট",
      value: `${formatBnNumber(stats.pendingPayoutsCount)} টি উত্তোলন রিকোয়েস্ট`,
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-50",
      link: "/admin/payouts",
    },
    {
      label: "মোট অর্ডার সংখ্যা",
      value: formatBnNumber(stats.totalOrders),
      icon: ShoppingBag,
      color: "text-[#172033]",
      bg: "bg-slate-100",
    },
    {
      label: "সক্রিয় অনুমোদিত মার্কেটার",
      value: formatBnNumber(stats.activeMarketersCount),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "মোট অ্যাফিলিয়েট ক্লিক",
      value: formatBnNumber(stats.totalClicks),
      icon: MousePointerClick,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "মোট অ্যাফিলিয়েট কনভার্সন",
      value: `${formatBnNumber(stats.totalConversions)} টি সফল সেল`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          সিস্টেম ওভারভিউ ও মেট্রিক্স
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          লাইভ প্ল্যাটফর্ম পারফরম্যান্স, পেমেন্ট ভেরিফিকেশন কিউ এবং ফিন্যান্সিয়াল সামারি
        </p>
      </div>

      {/* Grid of 8 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B]">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-[#172033]">
                  {card.value}
                </div>
              </div>

              {card.link && (
                <Link
                  href={card.link}
                  className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 pt-2 border-t border-slate-100"
                >
                  <span>ম্যানেজ করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Actions Quick Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Applications Box */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#172033] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>অনুমোদনের অপেক্ষায় থাকা অ্যাফিলিয়েট আবেদন</span>
            </h3>
            <Link
              href="/admin/applications"
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              সবগুলো দেখুন
            </Link>
          </div>

          {pendingApps.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">নতুন কোনো পেন্ডিং আবেদন নেই।</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingApps.slice(0, 4).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#172033]">{app.fullName}</p>
                    <p className="text-slate-500">{app.email} • {app.phone}</p>
                    <p className="text-[11px] text-blue-600 mt-0.5">{app.occupation}</p>
                  </div>
                  <Link
                    href="/admin/applications"
                    className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-[11px] font-bold hover:bg-[#1D4ED8]"
                  >
                    রিভিউ করুন
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Instructions & Policy Reminder */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#172033] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>অ্যাডমিন ভেরিফিকেশন চেকলিস্ট</span>
          </h3>
          <ul className="space-y-3 text-xs text-[#475569]">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span><strong>bKash পেমেন্ট ভেরিফিকেশন:</strong> প্রাপ্ত TrxID ও প্রেরকের নম্বর বিকাশ মার্চেন্ট মেসেজের সাথে মিলিয়ে "Approve" করুন। পেমেন্ট অনুমোদনের সাথে সাথে স্টুডেন্টের কোর্স এনরোলমেন্ট এবং সংশ্লিষ্ট অ্যাফিলিয়েটের কমিশন স্বয়ংক্রিয়ভাবে কার্যকর হবে।</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><strong>স্বয়ংক্রিয় অডিট লগ:</strong> প্রতিটি অনুমোদন ও বাতিল সংক্রান্ত পদক্ষেপ সিস্টেমে সুরক্ষিতভাবে টাইমস্ট্যাম্প ও এডমিন তথ্যের সাথে সংরক্ষিত হয়।</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>পে-আউট নিরাপত্তা:</strong> উত্তোলন রিকোয়েস্ট পরিশোধ করার সময় বিকাশ বা ব্যাংকের সফল ট্রানজেকশন রেফারেন্স নাম্বার অন্তর্ভুক্ত করুন।</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
