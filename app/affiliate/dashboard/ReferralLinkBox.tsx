"use client";

import { useState } from "react";
import { MockCourse } from "@/lib/db/mock-data";
import { Copy, Check, Link as LinkIcon, Share2 } from "lucide-react";

interface Props {
  referralCode: string;
  courses: MockCourse[];
}

export function ReferralLinkBox({ referralCode, courses }: Props) {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://skilljobs.com";
  
  const generatedLink = selectedCourseSlug
    ? `${baseUrl}/courses/${selectedCourseSlug}?ref=${referralCode}`
    : `${baseUrl}/courses?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#2563EB]/30 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#172033]">আপনার ইউনিক রেফারেল লিংক জেনারেটর</h3>
            <p className="text-xs text-[#64748B]">যেকোনো কোর্স সিলেক্ট করে সরাসরি ট্র্যাকিং লিংক তৈরি ও কপি করুন</p>
          </div>
        </div>

        <select
          value={selectedCourseSlug}
          onChange={(e) => setSelectedCourseSlug(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:border-[#2563EB]"
        >
          <option value="">সকল কোর্স পেজ (ডিফল্ট)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.titleBn} ({c.commissionRate}% কমিশন)
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <input
          type="text"
          readOnly
          value={generatedLink}
          className="w-full bg-transparent font-mono text-xs text-[#172033] font-bold focus:outline-none px-2"
        />
        <button
          type="button"
          onClick={copyToClipboard}
          className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "কপি হয়েছে!" : "লিংক কপি করুন"}</span>
        </button>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
        <span>✓ ৩০ দিনের অটোমেটিক কুকি ট্র্যাকিং সক্রিয়</span>
        <span>✓ লাস্ট-ক্লিক অ্যাট্রিবিউশন গ্যারান্টি</span>
      </div>
    </div>
  );
}
