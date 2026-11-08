import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#172033] text-white">
      
      {/* Final Conversion CTA Banner */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-[#E53945] to-[#D12B37] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                আজই শুরু করুন আপনার অ্যাফিলিয়েট যাত্রা
              </h2>
              <p className="text-sm sm:text-base text-red-100">
                কোনো ইনভেস্টমেন্ট ছাড়াই শুরু করুন এবং প্রতি সফল বিক্রয়ে সর্বোচ্চ ৩৫% পর্যন্ত নিশ্চিত কমিশন উপভোগ করুন।
              </p>
              <div className="pt-2">
                <Link
                  href="/register?role=affiliate"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#E53945] font-extrabold text-sm hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all"
                >
                  <span>অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <div className="bg-white px-3.5 py-2 rounded-2xl inline-block shadow-md group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.png"
                  alt="Skilljobs Affiliation"
                  width={170}
                  height={62}
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              বাংলাদেশের প্রথম সারির প্রিমিয়াম এডুকেশনাল অ্যাফিলিয়েট প্ল্যাটফর্ম। আমরা মানসম্মত স্কিল ট্রেনিং পৌঁছে দিচ্ছি সারা দেশে এবং মার্কেটারদের এনে দিচ্ছি নির্ভরযোগ্য প্যাসিভ ইনকাম।
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>নিরাপদ ও ম্যানুয়ালি ভেরিফাইড bKash পেমেন্ট সিস্টেম</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              ন্যাভিগেশন
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">হোমপেজ</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">সব কোর্সসমূহ</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">সচরাচর প্রশ্নাবলী</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              ড্যাশবোর্ড লিঙ্কস
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li><Link href="/affiliate/dashboard" className="hover:text-white transition-colors">মার্কেটার ড্যাশবোর্ড</Link></li>
              <li><Link href="/student/dashboard" className="hover:text-white transition-colors">শিক্ষার্থী পোর্টাল</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">এডমিন প্যানেল</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">লগইন করুন</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">নতুন একাউন্ট খুলুন</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              যোগাযোগ ও সহায়তা
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2563EB]" />
                <span>support@skilljobs.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#16A34A]" />
                <span>+৮৮০ ১৭০০০০০০০০</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E53945] shrink-0 mt-0.5" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © ২০২৬ স্কিলজবস (Skilljobs). সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">শর্তাবলী</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">প্রাইভেসি পলিসি</Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">যোগাযোগ</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
