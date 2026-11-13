import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            আমাদের সাথে যোগাযোগ করুন
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#475569]">
            অ্যাফিলিয়েট প্রোগ্রাম বা কোর্স সম্পর্কিত যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিম সহায়তা করতে প্রস্তুত।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* Info cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#172033] text-sm">ইমেইল সাপোর্ট</h3>
                <p className="text-xs text-[#64748B] mt-0.5">যেকোনো প্রশ্ন বা পার্টনারশিপে ইমেইল পাঠান</p>
                <a href="mailto:corporate2@skill.jobs" className="text-xs sm:text-sm font-bold text-[#2563EB] hover:underline mt-1 block break-all">corporate2@skill.jobs</a>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#172033] text-sm">হটলাইন হেল্পলাইন</h3>
                <p className="text-xs text-[#64748B] mt-0.5">সকাল ১০টা থেকে রাত ৮টা (শনি - বৃহস্পতি)</p>
                <a href="tel:+8801847334785" className="text-xs sm:text-sm font-bold text-[#172033] hover:text-[#2563EB] mt-1 block">+880 1847-334785</a>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#172033] text-sm">প্রধান কার্যালয়</h3>
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">DT4, 102/1 Shukrabad, Mirpur Road, Dhanmondi, Dhaka - 1207</p>
              </div>
            </div>
          </div>

          {/* Contact form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-8 md:p-10 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <h2 className="text-xl font-bold text-[#172033] mb-6">বার্তা পাঠান</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="পূর্ণ নাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">ইমেইল</label>
                  <input
                    type="email"
                    required
                    placeholder="example@mail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">বিষয়</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অ্যাফিলিয়েট পে-আউট সংক্রান্ত"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">আপনার বার্তা</label>
                <textarea
                  rows={4}
                  required
                  placeholder="বিস্তারিত লিখুন..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E53945] hover:bg-[#D12B37] text-white font-bold text-sm shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
