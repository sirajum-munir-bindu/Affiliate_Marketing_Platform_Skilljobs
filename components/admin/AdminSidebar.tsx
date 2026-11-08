"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BookOpen,
  ShoppingBag,
  Coins,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  GraduationCap
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "ওভারভিউ ড্যাশবোর্ড", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "পেমেন্ট ভেরিফিকেশন", href: "/admin/payments", icon: CheckSquare, badge: "bKash" },
    { name: "অ্যাফিলিয়েট আবেদন", href: "/admin/applications", icon: Users },
    { name: "কোর্স ম্যানেজমেন্ট", href: "/admin/courses", icon: BookOpen },
    { name: "মার্কেটার তালিকা", href: "/admin/marketers", icon: GraduationCap },
    { name: "অর্ডার হিস্ট্রি", href: "/admin/orders", icon: ShoppingBag },
    { name: "কমিশন হিসাব", href: "/admin/commissions", icon: Coins },
    { name: "পে-আউট প্রসেসিং", href: "/admin/payouts", icon: CreditCard },
    { name: "অডিট ও সিকিউরিটি লগ", href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#172033] text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      
      {/* Brand */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/" className="block group">
          <div className="bg-white px-3 py-2 rounded-2xl mb-2.5 shadow-sm group-hover:scale-[1.02] transition-transform">
            <Image
              src="/images/logo.png"
              alt="Skilljobs Affiliation"
              width={160}
              height={59}
              priority
              className="h-9 w-auto mx-auto object-contain"
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="font-extrabold text-xs tracking-tight text-white block">
              এডমিন প্যানেল
            </span>
            <span className="text-[10px] text-red-300 bg-red-950/70 border border-red-900/40 px-2 py-0.5 rounded-full font-bold">
              Super Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#E53945] text-white shadow-md shadow-red-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-extrabold bg-red-950 text-red-200 px-2 py-0.5 rounded-md border border-red-800">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-white/5 flex items-center justify-between text-xs">
          <div className="truncate">
            <p className="font-bold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-slate-400 truncate">admin@skilljobs.com</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>লগআউট করুন</span>
        </button>
      </div>

    </aside>
  );
}
