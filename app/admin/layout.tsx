import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              মাস্টার কন্ট্রোল সেন্টার
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
            >
              <span>পাবলিক ওয়েবসাইট দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#475569]">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
