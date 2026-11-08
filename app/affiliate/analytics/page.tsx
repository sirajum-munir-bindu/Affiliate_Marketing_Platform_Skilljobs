import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { mockDb } from "@/lib/db/mock-data";
import { formatBnNumber } from "@/lib/utilities/cn";
import { MousePointerClick, TrendingUp, Calendar, Globe } from "lucide-react";

export default async function AffiliateAnalyticsPage() {
  const session = await getSession();
  const marketer = await DataService.getMarketerByUserId(session?.userId || "");

  const clicks = mockDb.clicks.filter((c) => c.marketerId === marketer?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          ক্লিক ও কনভার্সন অ্যানালিটিক্স
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          আপনার রেফারেল লিংকে ভিজিটরদের ক্লিক লগ ও রিয়েল-টাইম পারফরম্যান্স ডেটা।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">মোট ট্র্যাকিং ক্লিক</span>
          <div className="text-2xl font-black text-[#2563EB]">{formatBnNumber(marketer?.totalClicks || 0)}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">সফল কনভার্সন</span>
          <div className="text-2xl font-black text-[#E53945]">{formatBnNumber(marketer?.totalConversions || 0)} টি</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">গড় কনভার্সন রেট</span>
          <div className="text-2xl font-black text-[#16A34A]">
            {marketer && marketer.totalClicks > 0
              ? `${((marketer.totalConversions / marketer.totalClicks) * 100).toFixed(1)}%`
              : "০.০%"}
          </div>
        </div>
      </div>

      {/* Clicks Log Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-[#172033]">
          সর্বশেষ ক্লিক হিস্ট্রি
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#64748B] font-bold text-[11px]">
                <th className="py-3 px-4">ল্যান্ডিং পেজ</th>
                <th className="py-3 px-4">ডিভাইস / মাধ্যম</th>
                <th className="py-3 px-4 text-right">ক্লিকের সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {clicks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    কোনো সাম্প্রতিক ক্লিক লগ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                clicks.map((clk) => (
                  <tr key={clk.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-[#2563EB]">
                      {clk.landingPage}
                    </td>
                    <td className="py-3 px-4 text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>সোশ্যাল ও ডিরেক্ট ভিজিটর</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {new Date(clk.createdAt).toLocaleString("bn-BD")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
