import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6 text-[#172033]">
          <h1 className="text-3xl font-extrabold tracking-tight">ব্যবহারের সাধারণ শর্তাবলী (Terms & Conditions)</h1>
          <p className="text-xs text-slate-500">সর্বশেষ আপডেট: নভেম্বর ২০২৬</p>

          <div className="space-y-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-bold text-[#172033]">১. অ্যাফিলিয়েট পার্টনারশিপ নীতি</h2>
            <p>স্কিলজবস প্ল্যাটফর্মে অ্যাফিলিয়েট হিসেবে যোগদানের জন্য সঠিক তথ্য প্রদান আবশ্যক। যেকোনো বিভ্রান্তিকর তথ্য বা স্প্যাম মার্কেটিং কার্যক্রমের জন্য একাউন্ট স্থগিত বা বাতিল করার পূর্ণ অধিকার কর্তৃপক্ষের রয়েছে।</p>

            <h2 className="text-base font-bold text-[#172033]">২. আত্ম-রেফারেল (Self-Referral) নিষেধাজ্ঞা</h2>
            <p>কোনো অ্যাফিলিয়েট মার্কেটার নিজের রেফারেল লিংক ব্যবহার করে নিজের কোর্স ক্রয় করতে পারবেন না। এই ধরনের সেল অবৈধ হিসেবে গণ্য হবে এবং কোনো কমিশন প্রদান করা হবে না।</p>

            <h2 className="text-base font-bold text-[#172033]">৩. কমিশন ও পে-আউট নিয়মাবলী</h2>
            <p>প্রতিটি সেলের কমিশন শুধুমাত্র শিক্ষার্থী কর্তৃক সফলভাবে bKash পেমেন্ট সম্পন্ন করা এবং এডমিন টিম দ্বারা তা ভেরিফাই হওয়ার পরই কার্যকর হবে। ন্যূনতম ৫০০ টাকা অর্জিত হলে উত্তোলন রিকোয়েস্ট পাঠানো যাবে।</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
