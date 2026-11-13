"use client";

import { useState } from "react";
import { MockCourse } from "@/lib/db/mock-data";
import { formatBDT } from "@/lib/utilities/cn";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

interface Props {
  referralCode: string;
  courses: MockCourse[];
}

export function ReferralLinkBox({ referralCode, courses }: Props) {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://skilljobs.com";

  const selectedCourse = courses.find((c) => c.slug === selectedCourseSlug);

  const generatedLink = selectedCourseSlug
    ? `${baseUrl}/courses/${selectedCourseSlug}?ref=${referralCode}`
    : `${baseUrl}/courses?ref=${referralCode}`;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 tracking-tight">
              আপনার ইউনিক রেফারেল লিংক জেনারেটর
            </h3>
            <p className="text-xs text-slate-500">
              যেকোনো কোর্স সিলেক্ট করে সরাসরি ট্র্যাকিং লিংক তৈরি ও কপি করুন
            </p>
          </div>
        </div>

        <select
          value={selectedCourseSlug}
          onChange={(e) => setSelectedCourseSlug(e.target.value)}
          className="text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
        >
          <option value="">সকল কোর্স পেজ (ডিফল্ট)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.titleBn} ({c.commissionRate}% কমিশন)
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/90">
        <input
          type="text"
          readOnly
          value={generatedLink}
          className="w-full bg-transparent font-mono text-xs text-slate-800 font-bold focus:outline-none px-3 py-1.5"
        />
        <button
          type="button"
          onClick={copyToClipboard}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E53945] to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md shadow-red-500/20 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "কপি হয়েছে!" : "লিংক কপি করুন"}</span>
        </button>
      </div>

      {selectedCourse && (
        <div className="flex justify-end text-[11px] pt-1">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-black">
            প্রতি সেলে আয়:{" "}
            {formatBDT(Math.round((selectedCourse.price * selectedCourse.commissionRate) / 100))}{" "}
            ({selectedCourse.commissionRate}%)
          </span>
        </div>
      )}
    </div>
  );
}
