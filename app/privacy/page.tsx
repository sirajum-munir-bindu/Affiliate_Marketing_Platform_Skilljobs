import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6 text-[#172033]">
          <h1 className="text-3xl font-extrabold tracking-tight">প্রাইভেসি ও কুকি পলিসি (Privacy Policy)</h1>
          <p className="text-xs text-slate-500">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>

          <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-bold text-[#172033]">১. কুকি ট্র্যাকিং ও অ্যাট্রিবিউশন</h2>
            <p>আমাদের প্ল্যাটফর্ম ভিজিটরের ব্রাউজারে ৩০ দিনের জন্য একটি সুরক্ষিত ফার্স্ট-পার্টি কুকি সংরক্ষণ করে যাতে রেফারেল প্রদানকারী মার্কেটারের যথাযথ অ্যাট্রিবিউশন সংরক্ষিত থাকে।</p>

            <h2 className="text-base font-bold text-[#172033]">২. তথ্যের নিরাপত্তা</h2>
            <p>আমরা ব্যবহারকারীদের কোনো সংবেদনশীল পেমেন্ট তথ্য যেমন বিকাশ পিন বা ওটিপি সংরক্ষণ বা অনুরোধ করি না। সকল পাসওয়ার্ড সুরক্ষিতভাবে হ্যাশ আকারে সংরক্ষিত হয়।</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
