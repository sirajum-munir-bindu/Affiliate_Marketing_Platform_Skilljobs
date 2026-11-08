"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function AffiliateApplyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    occupation: "",
    channels: "",
    marketingExperience: "",
    whyJoin: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/affiliate/apply";
          return;
        }
        throw new Error(data.message || "আবেদন ব্যর্থ হয়েছে");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "আবেদন সম্পন্ন করা সম্ভব হয়নি");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-8 sm:p-12 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E53945] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              অ্যাফিলিয়েট পার্টনারশিপ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              অ্যাফিলিয়েট প্রোগ্রামের আবেদন ফর্ম
            </h1>
            <p className="text-xs sm:text-sm text-[#475569]">
              সঠিক তথ্য প্রদান করে আবেদন জমা দিন। আমাদের এডমিন টিম আপনার আবেদন যাচাই করে দ্রুত অনুমোদন করবে।
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[#172033]">আপনার আবেদন গৃহীত হয়েছে!</h2>
              <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                ধন্যবাদ। আপনার অ্যাফিলিয়েট আবেদনটি এডমিন পর্যালোচনায় রয়েছে। অনুমোদিত হওয়ার সাথে সাথে আপনার ড্যাশবোর্ডে রেফারেল লিংক জেনারেটর সক্রিয় হবে।
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/student/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-[#172033] text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  স্টুডেন্ট ড্যাশবোর্ডে যান
                </Link>
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-xl border border-slate-300 text-[#172033] text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  হোমপেজে ফিরে যান
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">পূর্ণ নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">বর্তমান পেশা</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শিক্ষার্থী, ডিজিটাল মার্কেটার, চাকুরিজীবী"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">ইমেইল অ্যাড্রেস</label>
                  <input
                    type="email"
                    required
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">মোবাইল নম্বর (bKash সহ)</label>
                  <input
                    type="tel"
                    required
                    placeholder="01712345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  প্রচারের মাধ্যমসমূহ (সোশ্যাল মিডিয়া পেজ/গ্রুপ/ইউটিউব লিংক)
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Facebook Page (30k), YouTube Channel, Telegram Group"
                  value={formData.channels}
                  onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  আপনার মার্কেটিং অভিজ্ঞতা সংক্ষেপে লিখুন
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="আপনার পূর্ববর্তী অভিজ্ঞতা বা কীভাবে কোর্স প্রচার করবেন..."
                  value={formData.marketingExperience}
                  onChange={(e) => setFormData({ ...formData, marketingExperience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  কেন আপনি স্কিলজবস অ্যাফিলিয়েট প্রোগ্রামে যোগ দিতে চান?
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="আপনার লক্ষ্য ও প্রত্যাশা..."
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? "আবেদন জমা হচ্ছে..." : "আবেদন সাবমিট করুন"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
