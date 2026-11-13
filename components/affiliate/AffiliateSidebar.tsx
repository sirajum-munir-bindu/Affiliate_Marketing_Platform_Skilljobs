"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Coins,
  CreditCard,
  LogOut,
  X,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface AffiliateSidebarProps {
  referralCode?: string;
  userName?: string;
  userEmail?: string;
  pendingPayoutsCount?: number;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function AffiliateSidebar({
  referralCode,
  userName = "Affiliate Partner",
  userEmail = "",
  pendingPayoutsCount = 0,
  isMobileOpen = false,
  onClose,
}: AffiliateSidebarProps) {
  const pathname = usePathname();

  const navigationGroups = [
    {
      title: "মেইন ওভারভিউ",
      items: [
        { name: "ওভারভিউ ড্যাশবোর্ড", href: "/affiliate/dashboard", icon: LayoutDashboard },
        { name: "রেফারেল লিংকসমূহ", href: "/affiliate/links", icon: LinkIcon },
      ],
    },
    {
      title: "আয় ও পে-আউট",
      items: [
        { name: "অর্জিত কমিশন", href: "/affiliate/commissions", icon: Coins },
        {
          name: "টাকা উত্তোলন (Payout)",
          href: "/affiliate/payouts",
          icon: CreditCard,
          badge: pendingPayoutsCount > 0 ? `${pendingPayoutsCount} পেন্ডিং` : "bKash",
          badgeColor:
            pendingPayoutsCount > 0
              ? "bg-amber-500 text-white"
              : "bg-red-950/80 text-rose-300 border border-red-800/60",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "AF";

  const sidebarContent = (
    <aside className="w-68 bg-[#0B1120] text-slate-300 flex flex-col shrink-0 h-screen max-h-screen border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/70 relative shrink-0">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <Link href="/" className="block group">
          <div className="bg-white/95 hover:bg-white px-3.5 py-2.5 rounded-2xl mb-3 shadow-md border border-white/10 group-hover:scale-[1.02] transition-transform flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Skilljobs Affiliation"
              width={160}
              height={55}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="font-extrabold text-[11px] tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              মার্কেটার পোর্টাল
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {referralCode || "PRO"}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Links Grouped */}
      <nav className="flex-1 px-3.5 py-4 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain">
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-lg shadow-red-500/25 font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs ${
                            item.badgeColor || "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2 bg-[#090D18] shrink-0">
        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B1120]" />
            </div>
            <div className="truncate">
              <p className="font-bold text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {userEmail || (referralCode ? `কোড: ${referralCode}` : "অ্যাফিলিয়েট পার্টনার")}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-900/40 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>লগআউট করুন</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 h-screen animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
