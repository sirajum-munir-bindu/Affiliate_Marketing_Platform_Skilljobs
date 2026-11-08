import { StudentSidebar } from "@/components/student/StudentSidebar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/student/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-sm font-bold text-[#172033]">
              স্বাগতম, {session.name}
            </h2>
            <p className="text-[11px] text-[#64748B]">স্টুডেন্ট লার্নিং ড্যাশবোর্ড</p>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
