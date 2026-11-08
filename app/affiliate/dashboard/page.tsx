import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import { ReferralLinkBox } from "./ReferralLinkBox";
import {
  MousePointerClick,
  TrendingUp,
  Wallet,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default async function AffiliateDashboardPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const courses = await DataService.getCourses(true);
  const commissions = await DataService.getMarketerCommissions(marketer?.id || "");

  const conversionRate = marketer && marketer.totalClicks > 0
    ? ((marketer.totalConversions / marketer.totalClicks) * 100).toFixed(1)
    : "0.0";

  const cards = [
    {
      label: "বর্তমান উত্তোলনযোগ্য ব্যালেন্স",
      value: formatBDT(marketer?.currentBalance || 0),
      icon: Wallet,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50",
      action: "/affiliate/payouts",
      actionLabel: "উত্তোলন করুন",
    },
    {
      label: "মোট অর্জিত কমিশন (লাইফটাইম)",
      value: formatBDT(marketer?.lifetimeEarnings || 0),
      icon: Coins,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
    },
    {
      label: "মোট রেফারেল ক্লিক",
      value: formatBnNumber(marketer?.totalClicks || 0),
      icon: MousePointerClick,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "সফল কনভার্সন (বিক্রি)",
      value: `${formatBnNumber(marketer?.totalConversions || 0)} টি (${conversionRate}%)`,
      icon: TrendingUp,
      color: "text-[#E53945]",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          পারফরম্যান্স ও আর্নিং ওভারভিউ
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার রেফারেল ট্র্যাকিং স্ট্যাটাস, লাইভ আর্নিংস এবং সফল কোর্স কনভার্সন
        </p>
      </div>

      {/* Referral Link Quick Tool */}
      <ReferralLinkBox
        referralCode={marketer?.referralCode || "AFF2026"}
        courses={courses}
      />

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B]">{c.label}</span>
                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-[#172033]">{c.value}</div>
              </div>

              {c.action && (
                <Link
                  href={c.action}
                  className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1 pt-2 border-t border-slate-100"
                >
                  <span>{c.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Conversions / Commission Ledger */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#172033] flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#2563EB]" />
            <span>সাম্প্রতিক সফল কনভার্সন ও অর্জিত কমিশন</span>
          </h3>
          <Link
            href="/affiliate/commissions"
            className="text-xs font-bold text-[#2563EB] hover:underline"
          >
            সব দেখুন
          </Link>
        </div>

        {commissions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            এখনও কোনো কমিশন রেকর্ড হয়নি। আপনার রেফারেল লিংক শেয়ার করে প্রথম সেল সম্পন্ন করুন!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#64748B] font-bold text-[11px]">
                  <th className="py-2 px-3">অর্ডার নং</th>
                  <th className="py-2 px-3">কোর্স</th>
                  <th className="py-2 px-3">কমিশন রেট</th>
                  <th className="py-2 px-3">কমিশন পরিমাণ</th>
                  <th className="py-2 px-3">স্ট্যাটাস</th>
                  <th className="py-2 px-3 text-right">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#172033]">
                {commissions.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB]">{c.orderNumber}</td>
                    <td className="py-2.5 px-3 font-medium">{c.courseTitleBn}</td>
                    <td className="py-2.5 px-3 font-bold">{c.rate}%</td>
                    <td className="py-2.5 px-3 font-black text-[#16A34A]">{formatBDT(c.amount)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
