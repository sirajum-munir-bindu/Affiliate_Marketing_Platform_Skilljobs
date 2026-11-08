import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { mockDb } from "@/lib/db/mock-data";
import { notFound, redirect } from "next/navigation";
import { CoursePlayer } from "./CoursePlayer";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default async function StudentLearnPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?redirect=/student/learn/${params.slug}`);
  }

  const course = await DataService.getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }

  // Server-side check for active enrollment
  const hasAccess =
    session.role === "ADMIN" ||
    mockDb.enrollments.some(
      (e) => e.customerId === session.userId && e.courseId === course.id
    );

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-[#E53945] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">অননুমোদিত অ্যাক্সেস</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          এই কোর্সের পাঠ্যসূচি দেখার জন্য আপনার কোনো সক্রিয় এনরোলমেন্ট নেই অথবা আপনার bKash পেমেন্ট এখনও ভেরিফাই হয়নি।
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href={`/courses/${course.slug}?checkout=true`}
            className="px-5 py-2.5 rounded-xl bg-[#E53945] text-white font-bold text-xs hover:bg-[#D12B37]"
          >
            কোর্সে ভর্তি হোন
          </Link>
          <Link
            href="/student/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
          >
            ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/student/dashboard"
          className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-[#172033] tracking-tight">{course.titleBn}</h1>
          <p className="text-xs text-slate-500">{course.categoryNameBn} • স্টুডেন্ট লার্নিং মোড</p>
        </div>
      </div>

      <CoursePlayer course={course} />
    </div>
  );
}
