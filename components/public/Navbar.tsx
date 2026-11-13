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
  const [scrolled, setScrolled] = useState(false);
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

  // Track scroll position for subtle capsule elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      {/* Floating Capsule Header Container */}
      <header className="sticky top-2 sm:top-4 z-50 w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300">
        <div
          className={`relative rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-900/10"
              : "bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 hover:border-slate-300"
          }`}
        >
          {/* Brand Logo - Inside Capsule */}
          <Link
            href="/"
            className="flex items-center group shrink-0 pl-1 sm:pl-2"
            aria-label="Skilljobs Affiliation Home"
          >
            <Image
              src="/images/logo.png"
              alt="Skilljobs Affiliation"
              width={160}
              height={58}
              priority
              className="h-8 sm:h-9 md:h-10 w-auto object-contain group-hover:scale-[1.03] transition-transform"
            />
          </Link>

          {/* Desktop Navigation Links - Segmented Pill */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-100/80 border border-slate-200/60 shadow-inner-xs"
            aria-label="Desktop Navigation"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs xl:text-sm font-bold px-3.5 xl:px-4 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#E53945] shadow-xs"
                      : "text-[#475569] hover:text-[#E53945] hover:bg-white/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTAs - Capsule Pills */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0 pr-1">
            {user ? (
              <div className="flex items-center gap-2">
                {/* User chip */}
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <span className="max-w-[85px] 2xl:max-w-[110px] truncate font-medium">
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-[#2563EB] font-bold px-1.5 py-0.5 rounded-full">
                    {getRoleBadgeLabel(user.role)}
                  </span>
                </div>

                {/* Dashboard CTA */}
                <Link
                  href={getDashboardLink()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 font-bold text-xs xl:text-sm transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>ড্যাশবোর্ড</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="লগআউট"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                  aria-label="লগআউট করুন"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs xl:text-sm font-bold text-[#172033] hover:text-[#2563EB] hover:bg-slate-100 px-3.5 py-2 rounded-full transition-colors whitespace-nowrap"
                >
                  লগইন
                </Link>
                <Link
                  href="/register?role=affiliate"
                  className="inline-flex items-center gap-1.5 px-4 xl:px-5 py-2 xl:py-2.5 rounded-full bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-xs xl:text-sm shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all group shrink-0 whitespace-nowrap"
                >
                  <span className="hidden xl:inline">অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
                  <span className="xl:hidden">যোগ দিন</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Controls (Right) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            {/* Tablet Quick Action */}
            {user ? (
              <Link
                href={getDashboardLink()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold hover:bg-[#2563EB]/20 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>ড্যাশবোর্ড</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-[#172033] hover:text-[#2563EB] rounded-full hover:bg-slate-100 transition-colors"
                >
                  লগইন
                </Link>
                <Link
                  href="/register?role=affiliate"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#E53945] hover:bg-[#D12B37] rounded-full shadow-xs"
                >
                  <span>যোগ দিন</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Capsule Hamburger / Close Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#475569] hover:text-[#172033] hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              aria-label={isOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation-menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Card (Floating under the Capsule) */}
        {isOpen && (
          <div
            id="mobile-navigation-menu"
            className="mt-2.5 rounded-3xl bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 lg:hidden"
          >
            <div className="space-y-4">
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-full transition-colors shrink-0"
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
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] font-medium transition-all ${
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
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-sm transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register?role=affiliate"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#E53945] hover:bg-[#D12B37] text-white font-semibold text-sm shadow-sm transition-all"
                    >
                      <span>অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold text-sm transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>লগইন করুন</span>
                    </Link>
                  </>
                )}

                {/* Trust Badge at bottom of mobile menu */}
                <div className="mt-1 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-center">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-xs text-slate-500 font-medium">
                    প্রতি বিক্রয়ে সর্বোচ্চ ৩৫% পর্যন্ত নিশ্চিত কমিশন ও bKash পেআউট
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}
    </>
  );
}
