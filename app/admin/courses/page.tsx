import { DataService } from "@/lib/services/data-service";
import { formatBDT, formatBnNumber } from "@/lib/utilities/cn";
import Link from "next/link";
import { Plus, BookOpen, Clock, Tag } from "lucide-react";

export default async function AdminCoursesPage() {
  const courses = await DataService.getCourses(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#172033] tracking-tight">
            কোর্স ম্যানেজমেন্ট
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            কোর্স তৈরি, মূল্য নির্ধারণ, কমিশন রেট এবং কোর্স স্ট্যাটাস পরিবর্তন করুন।
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">কোর্স</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">অ্যাফিলিয়েট কমিশন (%)</th>
                <th className="py-3.5 px-4">লেসন সংখ্যা</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={c.thumbnail} alt={c.titleBn} className="w-12 h-8 rounded object-cover shrink-0" />
                      <div>
                        <p className="font-bold line-clamp-1">{c.titleBn}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{c.categoryNameBn}</td>
                  <td className="py-3.5 px-4 font-black text-[#E53945]">{formatBDT(c.price)}</td>
                  <td className="py-3.5 px-4 font-extrabold text-[#16A34A]">{c.commissionRate}%</td>
                  <td className="py-3.5 px-4">{formatBnNumber(c.totalLessons)} টি</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/courses/${c.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-[#2563EB] hover:underline"
                    >
                      প্রিভিউ দেখুন
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
