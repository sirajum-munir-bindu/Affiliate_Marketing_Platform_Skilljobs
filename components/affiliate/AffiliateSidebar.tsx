"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart2,
  Coins,
  CreditCard,
  FileImage,
  User,
  LogOut,
  ExternalLink
} from "lucide-react";

export function AffiliateSidebar({ referralCode }: { referralCode?: string }) {
  const pathname = usePathname();

  const links = [
    { name: "ওভারভিউ", href: "/affiliate/dashboard", icon: LayoutDashboard },
    { name: "রেফারেল লিংকসমূহ", href: "/affiliate/links", icon: LinkIcon },
    { name: "ক্লিক ও সেলস অ্যানালিটিক্স", href: "/affiliate/analytics", icon: BarChart2 },
    { name: "অর্জিত কমিশন", href: "/affiliate/commissions", icon: Coins },
    { name: "টাকা উত্তোলন (Payout)", href: "/affiliate/payouts", icon: CreditCard },
    { name: "মার্কেটিং রিসোর্স", href: "/affiliate/resources", icon: FileImage },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-white text-[#172033] flex flex-col shrink-0 min-h-screen border-r border-[#E2E8F0]">
      
      {/* Brand */}
      <div className="p-5 border-b border-[#E2E8F0]">
        <Link href="/" className="block group">
          <Image
            src="/images/logo.png"
            alt="Skilljobs Affiliation"
            width={160}
            height={59}
            priority
            className="h-10 w-auto object-contain mb-3 group-hover:scale-[1.02] transition-transform"
          />
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="font-extrabold text-xs tracking-tight text-[#172033] block">
              মার্কেটার পোর্টাল
            </span>
            <span className="text-[10px] text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full font-bold">
              {referralCode ? `কোড: ${referralCode}` : "Affiliate Pro"}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "text-[#475569] hover:text-[#172033] hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#64748B]"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#E2E8F0] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <span>ওয়েবসাইট ভিজিট করুন</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>লগআউট</span>
        </button>
      </div>

    </aside>
  );
}
