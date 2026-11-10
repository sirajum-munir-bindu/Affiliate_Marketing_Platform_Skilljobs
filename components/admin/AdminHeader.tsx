"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ExternalLink,
  Search,
  Menu,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronDown
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  pendingPaymentsCount?: number;
  pendingApplicationsCount?: number;
}

export function AdminHeader({
  onToggleSidebar,
  pendingPaymentsCount = 0,
  pendingApplicationsCount = 0,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const totalAlerts = pendingPaymentsCount + pendingApplicationsCount;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
      
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search input with keyboard shortcut hint */}
        <div className="relative max-w-xs sm:max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="কোর্স, ট্রানজেকশন TrxID বা মার্কেটার সার্চ..."
            className="w-full pl-10 pr-12 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-slate-300 focus:outline-hidden transition-all shadow-2xs"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Live system pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>সিস্টেম লাইভ ও সুরক্ষিত</span>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Public Website Button */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-2xs"
        >
          <span className="hidden sm:inline">পাবলিক ওয়েবসাইট</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
            title="নোটিফিকেশন"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-xs">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">পেন্ডিং নোটিফিকেশন</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  {totalAlerts} টি অ্যাকশন প্রয়োজন
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {pendingPaymentsCount > 0 && (
                  <Link
                    href="/admin/payments"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">bKash পেমেন্ট পেন্ডিং</p>
                      <p className="text-[11px] text-slate-500">
                        {pendingPaymentsCount} টি স্টুডেন্ট পেমেন্ট ভেরিফিকেশনের অপেক্ষায়।
                      </p>
                    </div>
                  </Link>
                )}

                {pendingApplicationsCount > 0 && (
                  <Link
                    href="/admin/applications"
                    onClick={() => setShowNotifications(false)}
                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">নতুন অ্যাফিলিয়েট আবেদন</p>
                      <p className="text-[11px] text-slate-500">
                        {pendingApplicationsCount} জন নতুন মার্কেটার অনুমোদনের অপেক্ষায়।
                      </p>
                    </div>
                  </Link>
                )}

                {totalAlerts === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    কোনো নতুন জরুরি অ্যালার্ট নেই।
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            SA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-black text-slate-800 leading-tight">Super Admin</p>
            <p className="text-[10px] font-semibold text-emerald-600 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              মাস্টার অ্যাক্সেস
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}
