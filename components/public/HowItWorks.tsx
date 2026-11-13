import { UserCheck, Share2, Coins, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const steps = [
    {
      step: "০১",
      title: "সহজে নিবন্ধন করুন",
      description:
        "আমাদের প্ল্যাটফর্মে একাউন্ট তৈরি করে অ্যাফিলিয়েট পার্টনারশিপের জন্য আবেদন করুন। ২৪ ঘণ্টার মধ্যে দ্রুত একাউন্ট ভেরিফাই করা হয়।",
      icon: UserCheck,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      step: "০২",
      title: "কোর্সের লিংক শেয়ার করুন",
      description:
        "আপনার পছন্দের কোর্সের ইউনিক ট্র্যাকিং লিংক তৈরি করুন এবং ফেসবুক, ইউটিউব, টেলিগ্রাম বা বন্ধুদের সাথে শেয়ার করুন।",
      icon: Share2,
      color: "text-[#E53945]",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      step: "০৩",
      title: "আকর্ষণীয় কমিশন অর্জন করুন",
      description:
        "আপনার রেফারেল লিংকের মাধ্যমে যেকোনো শিক্ষার্থী কোর্স কিনলে ও পেমেন্ট ভেরিফাই হলে সরাসরি আপনার একাউন্টে ২০%-৩৫% কমিশন জমা হবে।",
      icon: Coins,
      color: "text-[#16A34A]",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold mb-3">
            সহজ ৩ টি ধাপ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            কীভাবে কাজ করে আমাদের অ্যাফিলিয়েট প্রোগ্রাম?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475569]">
            কোনো জটিলতা ছাড়াই মাত্র ৩টি সহজ ধাপে শুরু করুন আপনার বিশ্বস্ত প্যাসিভ ইনকাম যাত্রা।
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border ${item.border} p-5 sm:p-8 shadow-sm hover:shadow-md transition-all group`}
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-200 group-hover:text-slate-300 transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#172033] mb-2 sm:mb-3 group-hover:text-[#2563EB] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/register?role=affiliate"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-sm shadow-md transition-all group"
          >
            <span>এখনই অ্যাফিলিয়েট হিসেবে যোগ দিন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
