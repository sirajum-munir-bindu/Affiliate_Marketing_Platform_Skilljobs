import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { ReferralLinkBox } from "../dashboard/ReferralLinkBox";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import Link from "next/link";
import { ExternalLink, Link as LinkIcon, Tag, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliateLinksPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const courses = await DataService.getCourses(true);
  const refCode = marketer?.referralCode || session?.referralCode || "TANVIR50";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight flex items-center gap-2.5">
            <span>রেফারেল লিংক ম্যানেজমেন্ট</span>
            <span className="text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {formatBnNumber(courses.length)} টি কোর্স
            </span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            কোর্স অনুযায়ী লিংক কপি করুন এবং ফেসবুক, ইউটিউব ও গ্রুপে শেয়ার করে কমিশন আয় শুরু করুন।
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          <LinkIcon className="w-4 h-4 text-blue-600" />
          <span>আপনার কোড:</span>
          <span className="font-mono font-black text-blue-600">{refCode}</span>
        </div>
      </div>

      <ReferralLinkBox referralCode={refCode} courses={courses} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const commission = Math.round((course.price * course.commissionRate) / 100);
          return (
            <div
              key={course.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.titleBn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#E53945] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{course.commissionRate}% কমিশন</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-300" />
                    <span>{course.categoryNameBn}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="font-black text-sm text-[#172033] line-clamp-2 leading-snug">
                    {course.titleBn}
                  </h4>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#E53945]">
                      {formatBDT(course.price)}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatBDT(course.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs font-bold text-[#16A34A]">
                    <span>প্রতি সেলে কমিশন:</span>
                    <span className="font-black text-sm">{formatBDT(commission)}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 text-[11px] font-semibold">
                  ?ref={refCode}
                </span>
                <Link
                  href={`/courses/${course.slug}?ref=${refCode}`}
                  target="_blank"
                  prefetch={false}
                  className="font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-100 hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  <span>প্রিভিউ দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
