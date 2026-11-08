import { mockDb } from "@/lib/db/mock-data";
import { ShieldAlert, User, Clock, FileText } from "lucide-react";

export default function AdminAuditLogsPage() {
  const logs = [...mockDb.auditLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#172033] tracking-tight">
          অডিট ও সিকিউরিটি লগ
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          পেমেন্ট অনুমোদন, অ্যাফিলিয়েট যাচাই ও ফিন্যান্সিয়াল ট্রানজেকশনের সম্পূর্ণ অপরিবর্তনযোগ্য ইতিহাস।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#E53945] bg-red-50 px-2 py-0.5 rounded text-[10px]">
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-700">{log.entity}</span>
                </div>
                <p className="text-[#172033] font-medium leading-relaxed">{log.details}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#2563EB]" />
                    {log.actorEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleString("bn-BD")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
