"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  HelpCircle,
  Phone,
  Home,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Close mobile menu whenever pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu on Escape key press or screen resize to desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed with redirect regardless
    }
    window.location.href = "/";
  };

  const navLinks = [
    { name: "হোম", href: "/", icon: Home },
    { name: "কোর্সসমূহ", href: "/courses", icon: BookOpen },
    { name: "প্রশ্ন সমূহ", href: "/faq", icon: HelpCircle },
    { name: "যোগাযোগ", href: "/contact", icon: Phone },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "AFFILIATE") return "/affiliate/dashboard";
    return "/student/dashboard";
  };

  const getRoleBadgeLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "অ্যাডমিন";
      case "AFFILIATE":
        return "অ্যাফিলিয়েট";
      case "STUDENT":
        return "শিক্ষার্থী";
      default:
        return role;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Brand Logo - Responsive for Mobile & Desktop */}
            <Link
              href="/"
              className="flex items-center group shrink-0"
              aria-label="Skilljobs Affiliation Home"
            >
              <Image
                src="/images/logo.png"
                alt="Skilljobs Affiliation"
                width={200}
                height={74}
                priority
                className="h-10 sm:h-12 md:h-14 lg:h-[56px] w-auto object-contain group-hover:scale-[1.02] transition-transform"
              />
            </Link>

            {/* Desktop Navigation Links (Laptops & Desktops: lg, xl, 2xl) */}
            <nav
              className="hidden lg:flex items-center lg:gap-1.5 xl:gap-4 2xl:gap-6"
              aria-label="Desktop Navigation"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] xl:text-[14px] 2xl:text-[15px] font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? "text-[#E53945] font-semibold bg-red-50/80"
                        : "text-[#475569] hover:text-[#E53945] hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right CTAs */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
              {user ? (
                <div className="flex items-center gap-2 xl:gap-3">
                  {/* User chip */}
                  <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <span className="max-w-[85px] 2xl:max-w-[120px] truncate font-medium">
                      {user.name}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-[#2563EB] font-semibold px-1.5 py-0.5 rounded">
                      {getRoleBadgeLabel(user.role)}
                    </span>
                  </div>

                  {/* Dashboard CTA */}
                  <Link
                    href={getDashboardLink()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 xl:px-4 xl:py-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/15 font-semibold text-xs xl:text-sm transition-colors whitespace-nowrap"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>ড্যাশবোর্ড</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    title="লগআউট"
                    className="p-2 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors"
                    aria-label="লগআউট করুন"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 xl:gap-3">
                  <Link
                    href="/login"
                    className="text-xs xl:text-sm font-semibold text-[#172033] hover:text-[#2563EB] px-2.5 xl:px-3 py-2 transition-colors whitespace-nowrap"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/register?role=affiliate"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 xl:px-5 xl:py-2.5 rounded-lg bg-[#E53945] hover:bg-[#D12B37] text-white font-semibold text-xs xl:text-sm shadow-xs hover:shadow transition-all group shrink-0 whitespace-nowrap"
                  >
                    <span className="hidden xl:inline">অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
                    <span className="xl:hidden">যোগ দিন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile & Tablet Controls (Right) */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              {/* Tablet Quick Action (640px - 1023px) */}
              {user ? (
                <Link
                  href={getDashboardLink()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] text-xs font-semibold hover:bg-[#2563EB]/20 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>ড্যাশবোর্ড</span>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="px-2.5 py-1.5 text-xs font-semibold text-[#172033] hover:text-[#2563EB] rounded-lg"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/register?role=affiliate"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#E53945] hover:bg-[#D12B37] rounded-lg shadow-xs"
                  >
                    <span>যোগ দিন</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Hamburger / Close Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl text-[#475569] hover:text-[#172033] hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                aria-label={isOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-16 sm:top-20 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile & Tablet Navigation Menu Drawer / Dropdown */}
      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="fixed top-16 sm:top-20 inset-x-0 bg-white border-b border-slate-200 shadow-2xl z-50 max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain transition-all lg:hidden"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 space-y-4">
            {/* User Profile Card (when authenticated on mobile) */}
            {user && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#172033] truncate">
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-[#2563EB]">
                        {getRoleBadgeLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>
            )}

            {/* Navigation Links List */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                মেনু লিঙ্ক
              </span>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const IconComponent = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                      isActive
                        ? "bg-red-50 text-[#E53945] font-semibold border-l-4 border-[#E53945]"
                        : "text-[#334155] hover:bg-slate-50 hover:text-[#E53945]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-[#E53945]" : "text-slate-400"
                        }`}
                      />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 ${
                        isActive ? "text-[#E53945]" : "text-slate-300"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Call to Actions Section */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              {user ? (
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register?role=affiliate"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-semibold text-sm shadow-sm transition-all"
                  >
                    <span>অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold text-sm transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>লগইন করুন</span>
                  </Link>
                </>
              )}

              {/* Trust Badge at bottom of mobile menu */}
              <div className="mt-1 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-center">
                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="text-xs text-slate-500 font-medium">
                  প্রতি বিক্রয়ে সর্বোচ্চ ৩৫% পর্যন্ত নিশ্চিত কমিশন ও bKash পেআউট
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
