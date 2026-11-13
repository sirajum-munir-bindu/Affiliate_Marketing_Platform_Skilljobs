import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  PlayCircle,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getSession();
  const data = await DataService.getStudentDashboardData(session?.userId || "");

  const pendingPayments = data.payments.filter((p: any) => p.status === "SUBMITTED");
  const rejectedNeedingRetry = data.payments.filter(
    (p: any) =>
      p.status === "REJECTED" &&
      !data.payments.some(
        (other: any) =>
          other.orderId === p.orderId &&
          (other.status === "SUBMITTED" || other.status === "APPROVED")
      )
  );
  const paidOrdersCount = data.orders.filter((o: any) => o.status === "PAID").length;

  const statCards = [
    {
      label: "অ্যাক্টিভ এনরোল্ড কোর্স",
      subLabel: "আপনার ক্রয়কৃত ও সক্রিয় কোর্সসমূহ",
      value: `${formatBnNumber(data.enrolledCourses.length)} টি`,
      trend: data.enrolledCourses.length > 0 ? "ক্লাসের জন্য প্রস্তুত" : "কোর্স এনরোল করুন",
      trendPositive: data.enrolledCourses.length > 0,
      icon: BookOpen,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "hover:border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600",
      link: "#enrolled-courses",
    },
    {
      label: "মোট কোর্স অর্ডার",
      subLabel: `সফল অর্ডার: ${formatBnNumber(paidOrdersCount)} টি`,
      value: `${formatBnNumber(data.orders.length)} টি`,
      trend: "অর্ডার হিস্ট্রি",
      trendPositive: true,
      icon: ShoppingBag,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: "hover:border-blue-200",
      iconBg: "bg-blue-50 text-blue-600",
      link: "/student/orders",
    },
    {
      label: "পেমেন্ট ভেরিফিকেশন",
      subLabel:
        rejectedNeedingRetry.length > 0
          ? `${formatBnNumber(rejectedNeedingRetry.length)} টি বাতিল পেমেন্ট সংশোধনযোগ্য`
          : pendingPayments.length > 0
          ? `${formatBnNumber(pendingPayments.length)} টি পেমেন্ট পর্যালোচনায়`
          : "সব পেমেন্ট আপডেটেড",
      value: `${formatBnNumber(data.payments.length)} টি`,
      trend:
        rejectedNeedingRetry.length > 0
          ? "সংশোধন প্রয়োজন"
          : pendingPayments.length > 0
          ? "যাচাই অপেক্ষমান"
          : "ভেরিফায়েড",
      trendPositive: rejectedNeedingRetry.length === 0 && pendingPayments.length === 0,
      alert: rejectedNeedingRetry.length > 0,
      icon: CreditCard,
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "hover:border-rose-200",
      iconBg: "bg-rose-50 text-rose-600",
      link: "/student/payments",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Dark Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#111C35] to-[#0B1120] border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>স্টুডেন্ট লার্নিং হাব • Skilljobs Affiliation</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              স্বাগতম, {session?.name || "শিক্ষার্থী"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              আপনার এনরোল্ড কোর্সগুলো থেকে ক্লাস শুরু করুন, অর্ডার ও পেমেন্ট স্ট্যাটাস ট্র্যাক করুন এবং নতুন স্কিল ডেভেলপমেন্ট কোর্স এক্সপ্লোর করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black transition-all shadow-md hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4 text-red-600" />
              <span>নতুন কোর্স দেখুন</span>
            </Link>

            <Link
              href="/student/payments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-600/30 hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>পেমেন্ট স্ট্যাটাস</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Alerts */}
      {rejectedNeedingRetry.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm">
                আপনার {formatBnNumber(rejectedNeedingRetry.length)} টি পেমেন্ট বাতিল করা হয়েছে
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                ভুল TrxID বা তথ্যের কারণে পেমেন্ট যাচাই সম্পন্ন হয়নি। অনুগ্রহ করে সঠিক TrxID পুনরায় জমা দিন।
              </p>
            </div>
          </div>
          <Link
            href="/student/payments"
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shrink-0 hover:bg-rose-700 text-center"
          >
            সঠিক TrxID জমা দিন
          </Link>
        </div>
      )}

      {pendingPayments.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm">
                আপনার {formatBnNumber(pendingPayments.length)} টি bKash পেমেন্ট পর্যালোচনায় রয়েছে
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                এডমিন প্যানেলে TrxID ভেরিফাই সম্পন্ন হলেই কোর্সটি স্বয়ংক্রিয়ভাবে সক্রিয় হবে।
              </p>
            </div>
          </div>
          <Link
            href="/student/payments"
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shrink-0 hover:bg-amber-700 text-center"
          >
            স্ট্যাটাস দেখুন
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`group relative bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${card.borderColor}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-bold text-slate-600 leading-tight">
                    {card.label}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {card.value}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{card.subLabel}</p>
                </div>
              </div>

              <div className="relative z-10 pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    card.alert
                      ? "bg-rose-100 text-rose-700"
                      : card.trendPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {card.trend}
                </span>

                <Link
                  href={card.link}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>বিস্তারিত</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrolled Courses Grid */}
      <div id="enrolled-courses" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#172033] tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E53945]" />
              <span>অ্যাক্টিভ এনরোল্ড কোর্স ({formatBnNumber(data.enrolledCourses.length)} টি)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              যে কোনো কোর্সে ক্লিক করে ভিডিও লেসন ও মডিউল শুরু করুন
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>আরও কোর্স দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-black text-slate-800">
                আপনার কোনো অ্যাক্টিভ এনরোলমেন্ট নেই
              </p>
              <p className="text-xs text-slate-500 mt-1">
                পছন্দের স্কিল ডেভেলপমেন্ট কোর্সে ভর্তি হয়ে আজই শেখা শুরু করুন।
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E53945] to-rose-600 text-white text-xs font-black hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20"
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
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      এনরোল্ড
                    </span>
                    {course.categoryNameBn && (
                      <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-300" />
                        {course.categoryNameBn}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-black text-sm text-[#172033] line-clamp-2 leading-snug">
                      {course.titleBn}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {course.summaryBn}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                      <span>{formatBnNumber(course.totalLessons || 0)} টি লেসন</span>
                      <span>{course.duration || "সেলফ-পেসড"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/student/learn/${course.slug}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
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

      {/* Recent Orders Preview */}
      {data.orders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 tracking-tight">
                  সাম্প্রতিক অর্ডারসমূহ
                </h3>
                <p className="text-xs text-slate-500">আপনার সর্বশেষ কোর্স ক্রয়ের তালিকা</p>
              </div>
            </div>
            <Link
              href="/student/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>সব দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {data.orders.slice(0, 4).map((o: any) => (
              <div
                key={o.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">
                      {o.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        o.status === "PAID"
                          ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="font-medium text-slate-700 truncate mt-0.5">
                    {o.courseTitleBn}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-[#E53945] text-sm block">
                    {formatBDT(o.price)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString("bn-BD")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
