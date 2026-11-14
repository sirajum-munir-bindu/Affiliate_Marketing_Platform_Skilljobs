"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Lock, Mail, AlertCircle, ShieldCheck, UserCheck, Home } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "লগইন ব্যর্থ হয়েছে");
      }

      window.location.href = data.redirectUrl || "/student/dashboard";
    } catch (err: any) {
      setErrorMessage(err.message || "লগইন ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-3 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-5 sm:p-8 md:p-10 space-y-6">
        
        {/* Back to Home Option */}
        <div className="flex items-center justify-between -mt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#E53945] px-2.5 py-1.5 rounded-lg hover:bg-red-50/70 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>হোমে ফিরুন</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            title="হোমপেজ"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center group mb-2">
            <Image
              src="/images/logo.png"
              alt="Skilljobs Affiliation"
              width={190}
              height={70}
              priority
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">লগইন করুন</h1>
          <p className="text-xs text-[#64748B]">
            আপনার ইমেইল বা ফোন নম্বর ও পাসওয়ার্ড দিয়ে একাউন্টে প্রবেশ করুন
          </p>
        </div>

        {/* Admin Fast Login Pill */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div className="text-[12px] font-bold text-[#64748B] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#2563EB]" />
            <span>এডমিন এক্সেস:</span>
          </div>
          <button
            type="button"
            onClick={() => fillQuickLogin("admin@skilljobs.com", "Admin@123456")}
            className="py-1 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-[#E53945] font-bold text-[11px] transition-colors"
          >
            Super Admin লগইন
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              ইমেইল বা মোবাইল নম্বর
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="example@mail.com বা 01712345678"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#172033]">পাসওয়ার্ড</label>
              <Link href="#" className="text-[11px] text-[#2563EB] hover:underline font-semibold">
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "যাচাই করা হচ্ছে..." : "লগইন করুন"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100 space-y-2 text-xs text-[#64748B]">
          <p>
            একাউন্ট নেই?{" "}
            <Link href="/register" className="text-[#2563EB] font-bold hover:underline">
              নতুন একাউন্ট খুলুন
            </Link>
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#E53945] transition-colors font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              <span>হোমপেজে ফিরে যান</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
