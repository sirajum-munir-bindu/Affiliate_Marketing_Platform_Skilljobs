"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, User, Mail, Phone, Lock, AlertCircle, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";

function RegisterContent() {
  const searchParams = useSearchParams();
  const isAffiliateIntent = searchParams.get("role") === "affiliate";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("উভয় পাসওয়ার্ড এক হতে হবে");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      }

      if (isAffiliateIntent) {
        window.location.href = "/affiliate/apply";
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (err: any) {
      setErrorMessage(err.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
          {isAffiliateIntent ? "অ্যাফিলিয়েট হিসেবে যোগ দিন" : "নতুন একাউন্ট খুলুন"}
        </h1>
        <p className="text-xs text-[#64748B]">
          {isAffiliateIntent
            ? "সফলভাবে রেজিস্ট্রেশন সম্পন্ন করে অ্যাফিলিয়েট পার্টনারশিপ আবেদন করুন"
            : "স্কিলজবস প্ল্যাটফর্মে শিক্ষার্থী বা মেম্বার হিসেবে যুক্ত হোন"}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1">আপনার পূর্ণ নাম</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="যেমন: তানভীর আহমেদ"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1">ইমেইল অ্যাড্রেস</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1">মোবাইল নম্বর (bKash সহ)</label>
          <div className="relative">
            <input
              type="tel"
              required
              placeholder="01712345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1">পাসওয়ার্ড</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="পুনরায় পাসওয়ার্ড লিখুন"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? "একাউন্ট তৈরি হচ্ছে..." : "একাউন্ট তৈরি করুন"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 space-y-2 text-xs text-[#64748B]">
        <p>
          ইতিমধ্যে একাউন্ট আছে?{" "}
          <Link href="/login" className="text-[#2563EB] font-bold hover:underline">
            লগইন করুন
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
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-3 sm:p-4">
      <Suspense fallback={<div className="text-xs text-slate-400">লোড হচ্ছে...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
