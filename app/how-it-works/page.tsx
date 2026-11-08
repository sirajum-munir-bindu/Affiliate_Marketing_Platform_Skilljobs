import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { HowItWorks } from "@/components/public/HowItWorks";
import { CommissionCalculator } from "@/components/public/CommissionCalculator";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div className="bg-[#172033] text-white py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            কীভাবে কাজ করে স্কিলজবস অ্যাফিলিয়েট?
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto px-4">
            সহজ ৩টি ধাপে নিবন্ধন করুন, আপনার ইউনিক লিংকের মাধ্যমে কোর্স প্রচার করুন এবং প্রতি বিক্রয়ে আকর্ষণীয় কমিশন নিশ্চিত করুন।
          </p>
        </div>
        <HowItWorks />
        <CommissionCalculator />
      </main>
      <Footer />
    </div>
  );
}
