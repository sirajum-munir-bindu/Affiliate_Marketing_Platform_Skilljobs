"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ExternalLink,
  Menu,
  Copy,
  Check,
  Wallet,
  Clock,
  Coins
} from "lucide-react";
import { formatBDT } from "@/lib/utilities/cn";

interface AffiliateHeaderProps {
  onToggleSidebar?: () => void;
  userName?: string;
  referralCode?: string;
  currentBalance?: number;
  pendingPayoutsCount?: number;
  commissionsCount?: number;
}

export function AffiliateHeader({
  onToggleSidebar,
  userName = "Affiliate Partner",
  referralCode = "AFF2026",
  currentBalance = 0,
  pendingPayoutsCount = 0,
  commissionsCount = 0,
}: AffiliateHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [copied, setCopied] = useState(false);

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "AF";

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all shrink-0">
      {/* Left: Mobile hamburger, Referral Code pill, Live tracking pill */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Quick Referral Code Copy Pill */}
        <button
          type="button"
          onClick={handleCopyCode}
          title="রেফারেল কোড কপি করুন"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
        >
          <span className="text-slate-500 hidden sm:inline">রেফারেল কোড:</span>
          <span className="font-mono font-black text-blue-600">{referralCode}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Live tracking pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>৩০ দিনের অ্যাট্রিবিউশন ট্র্যাকিং সক্রিয়</span>
        </div>
      </div>

      {/* Right: Balance chip, Public website link, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <Link
          href="/affiliate/payouts"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200/80 transition-all"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          <span>{formatBDT(currentBalance)}</span>
        </Link>

        <Link
          href="/courses"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-2xs"
        >
          <span className="hidden sm:inline">পাবলিক কোর্সসমূহ</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="পারফরম্যান্স আপডেট"
          >
            <Bell className="w-4 h-4" />
            {pendingPayoutsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs">
                {pendingPayoutsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">অ্যাকাউন্ট সামারি</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  সক্রিয় পার্টনার
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <Link
                  href="/affiliate/payouts"
                  onClick={() => setShowNotifications(false)}
                  className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">উত্তোলনযোগ্য ব্যালেন্স</p>
                    <p className="text-[11px] text-slate-500">
                      বর্তমান ব্যালেন্স {formatBDT(currentBalance)} — উত্তোলনের জন্য প্রস্তুত।
                    </p>
                  </div>
                </Link>

                <Link
                  href="/affiliate/commissions"
                  onClick={() => setShowNotifications(false)}
                  className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">কমিশন রেকর্ড</p>
                    <p className="text-[11px] text-slate-500">
                      মোট {commissionsCount} টি কমিশন এন্ট্রি আপনার লেজারে যুক্ত আছে।
                    </p>
                  </div>
                </Link>

                {pendingPayoutsCount > 0 && (
                  <Link
                    href="/affiliate/payouts"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">পেন্ডিং পে-আউট</p>
                      <p className="text-[11px] text-slate-500">
                        {pendingPayoutsCount} টি উত্তোলন আবেদন প্রক্রিয়াধীন রয়েছে।
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Marketer Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="hidden md:block text-left max-w-[140px]">
            <p className="text-xs font-black text-slate-800 leading-tight truncate">{userName}</p>
            <p className="text-[10px] font-semibold text-emerald-600 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span className="truncate">ভেরিফাইড পার্টনার</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
