"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ExternalLink,
  Menu,
  BookOpen,
  Clock,
  AlertCircle
} from "lucide-react";

interface StudentHeaderProps {
  onToggleSidebar?: () => void;
  userName?: string;
  enrolledCount?: number;
  pendingPaymentsCount?: number;
  rejectedPaymentsCount?: number;
}

export function StudentHeader({
  onToggleSidebar,
  userName = "Student",
  enrolledCount = 0,
  pendingPaymentsCount = 0,
  rejectedPaymentsCount = 0,
}: StudentHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const totalAlerts = pendingPaymentsCount + rejectedPaymentsCount;

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "ST";

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all shrink-0">
      {/* Left: Mobile hamburger & Live status pill */}
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

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-700">
          <BookOpen className="w-3.5 h-3.5 text-[#E53945]" />
          <span>এনরোল্ড কোর্স: {enrolledCount} টি</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>লার্নিং পোর্টাল সক্রিয়</span>
        </div>
      </div>

      {/* Right: Course catalog link, Notifications, Student Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-2xs"
        >
          <span className="hidden sm:inline">কোর্স ক্যাটালগ</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="নোটিফিকেশন"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-xs">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">শিক্ষার্থী নোটিফিকেশন</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {totalAlerts} টি আপডেট
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {rejectedPaymentsCount > 0 && (
                  <Link
                    href="/student/payments"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">পেমেন্ট সংশোধন প্রয়োজন</p>
                      <p className="text-[11px] text-slate-500">
                        {rejectedPaymentsCount} টি পেমেন্ট বাতিল হয়েছে — সঠিক TrxID পুনরায় জমা দিন।
                      </p>
                    </div>
                  </Link>
                )}

                {pendingPaymentsCount > 0 && (
                  <Link
                    href="/student/payments"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">bKash পেমেন্ট পর্যালোচনাধীন</p>
                      <p className="text-[11px] text-slate-500">
                        {pendingPaymentsCount} টি পেমেন্ট এডমিন ভেরিফিকেশনের অপেক্ষায়।
                      </p>
                    </div>
                  </Link>
                )}

                {totalAlerts === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    সবকিছু আপডেটেড রয়েছে। কোনো নতুন অ্যালার্ট নেই।
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div className="hidden md:block text-left max-w-[140px]">
            <p className="text-xs font-black text-slate-800 leading-tight truncate">{userName}</p>
            <p className="text-[10px] font-semibold text-emerald-600 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span className="truncate">ভেরিফাইড শিক্ষার্থী</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
