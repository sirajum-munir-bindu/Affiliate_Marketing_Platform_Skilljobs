import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { ReferralLinkBox } from "../dashboard/ReferralLinkBox";
import { formatBDT } from "@/lib/utilities/cn";
import Link from "next/link";
import { ExternalLink, BookOpen } from "lucide-react";

export default async function AffiliateLinksPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");
  const courses = await DataService.getCourses(true);
  const refCode = marketer?.referralCode || session?.referralCode || "TANVIR50";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          রেফারেল লিংক ম্যানেজমেন্ট
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          কোর্স অনুযায়ী লিংক কপি করুন এবং ফেসবুক, ইউটিউব ও গ্রুপে শেয়ার করে আয় শুরু করুন।
        </p>
      </div>

      <ReferralLinkBox
        referralCode={refCode}
        courses={courses}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const commission = (course.price * course.commissionRate) / 100;
          return (
            <div key={course.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3">
                <img src={course.thumbnail} alt={course.titleBn} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-[#172033] line-clamp-1">{course.titleBn}</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{course.categoryNameBn}</p>
                  <p className="text-xs font-black text-[#E53945] mt-1">{formatBDT(course.price)}</p>
                </div>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-bold text-[#16A34A]">
                <span>প্রতি সেলে কমিশন:</span>
                <span>{formatBDT(commission)} ({course.commissionRate}%)</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 text-[11px]">
                  ref={refCode}
                </span>
                <Link
                  href={`/courses/${course.slug}?ref=${refCode}`}
                  target="_blank"
                  className="font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span>প্রিভিউ</span>
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
