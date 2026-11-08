import { AffiliateSidebar } from "@/components/affiliate/AffiliateSidebar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DataService } from "@/lib/services/data-service";

export default async function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/affiliate/dashboard");
  }

  // Check if role is AFFILIATE or ADMIN
  if (session.role !== "AFFILIATE" && session.role !== "ADMIN") {
    redirect("/affiliate/apply");
  }

  const marketer = await DataService.getMarketerByUserId(session.userId);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <AffiliateSidebar referralCode={marketer?.referralCode} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-bold text-[#172033]">
              স্বাগতম, {session.name}
            </h2>
            <p className="text-[11px] text-[#64748B]">অ্যাফিলিয়েট পার্টনার ড্যাশবোর্ড</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#16A34A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              সক্রিয় ভেরিফাইড পার্টনার
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
