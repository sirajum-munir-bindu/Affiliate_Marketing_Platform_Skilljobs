"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  ShoppingBag,
  CreditCard,
  User,
  LogOut,
  ExternalLink,
} from "lucide-react";

export function StudentSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "আমার কোর্সসমূহ", href: "/student/dashboard", icon: BookOpen },
    { name: "অর্ডার হিস্ট্রি", href: "/student/orders", icon: ShoppingBag },
    { name: "পেমেন্ট স্ট্যাটাস", href: "/student/payments", icon: CreditCard },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-white text-[#172033] flex flex-col shrink-0 min-h-screen border-r border-[#E2E8F0]">
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
              শিক্ষার্থী পোর্টাল
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Student Hub
            </span>
          </div>
        </Link>
      </div>

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
                  ? "bg-[#E53945] text-white shadow-md shadow-red-500/20"
                  : "text-[#475569] hover:text-[#172033] hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#64748B]"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0] space-y-2">
        <Link
          href="/courses"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-[#172033] bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>নতুন কোর্স কিনুন</span>
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
