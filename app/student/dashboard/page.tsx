import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import Link from "next/link";
import { BookOpen, Clock, PlayCircle, AlertCircle, ArrowRight } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getSession();
  const data = await DataService.getStudentDashboardData(session?.userId || "");

  const pendingPayments = data.payments.filter((p: any) => p.status === "SUBMITTED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          আমার কোর্সসমূহ ও শিক্ষা কার্যক্রম
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার ক্রয়কৃত অ্যাক্টিভ কোর্সগুলো থেকে সরাসরি ক্লাস শুরু করুন।
        </p>
      </div>

      {/* Pending Payment Notice if any */}
      {pendingPayments.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">আপনার {pendingPayments.length} টি bKash পেমেন্ট পর্যালোচনায় রয়েছে</p>
              <p className="text-[11px] text-amber-700 mt-0.5">এডমিন প্যানেলে TrxID ভেরিফাই সম্পন্ন হলেই কোর্সটি সক্রিয় হবে।</p>
            </div>
          </div>
          <Link
            href="/student/payments"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs shrink-0 hover:bg-amber-700"
          >
            স্ট্যাটাস দেখুন
          </Link>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#E53945]" />
          <span>অ্যাক্টিভ কোর্স ({formatBnNumber(data.enrolledCourses.length)} টি)</span>
        </h2>

        {data.enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center space-y-4">
            <p className="text-sm text-slate-500">আপনার কোনো অ্যাক্টিভ এনরোলমেন্ট নেই।</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E53945] text-white text-xs font-bold hover:bg-[#D12B37] shadow"
            >
              <span>কোর্স ক্যাটালগ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.enrolledCourses.map((course: any) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img src={course.thumbnail} alt={course.titleBn} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      এনরোল্ড
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-sm text-[#172033] line-clamp-1">{course.titleBn}</h3>
                    <p className="text-xs text-[#64748B] line-clamp-2">{course.summaryBn}</p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/student/learn/${course.slug}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#172033] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4 text-[#E53945]" />
                    <span>ক্লাস শুরু করুন</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
