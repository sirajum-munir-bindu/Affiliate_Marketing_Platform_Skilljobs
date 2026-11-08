"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { mockDb } from "@/lib/db/mock-data";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = mockDb.faqs;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            সাধারণ প্রশ্নোত্তর
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h2>
          <p className="mt-3 text-base text-[#475569]">
            অ্যাফিলিয়েট প্রোগ্রাম সম্পর্কে আপনার যেকোনো প্রশ্নের উত্তর জেনে নিন।
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#172033] hover:text-[#2563EB] transition-colors"
                >
                  <span>{faq.questionBn}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#64748B] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#2563EB]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-slate-100">
                    {faq.answerBn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
