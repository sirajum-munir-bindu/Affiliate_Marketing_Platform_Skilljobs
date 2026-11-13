import type { Metadata } from "next";
import { StudentLayoutClient } from "@/components/student/StudentLayoutClient";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DataService } from "@/lib/services/data-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icon.png?v=5", type: "image/png" },
      { url: "/favicon.ico?v=5", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=5",
    apple: "/apple-touch-icon.png?v=5",
  },
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/student/dashboard");
  }

  const data = await DataService.getStudentDashboardData(session.userId);
  const pendingPaymentsCount = data.payments.filter((p: any) => p.status === "SUBMITTED").length;
  const rejectedPaymentsCount = data.payments.filter(
    (p: any) =>
      p.status === "REJECTED" &&
      !data.payments.some(
        (other: any) =>
          other.orderId === p.orderId &&
          (other.status === "SUBMITTED" || other.status === "APPROVED")
      )
  ).length;

  return (
    <StudentLayoutClient
      userName={session.name}
      userEmail={session.email}
      enrolledCount={data.enrolledCourses.length}
      pendingPaymentsCount={pendingPaymentsCount}
      rejectedPaymentsCount={rejectedPaymentsCount}
    >
      {children}
    </StudentLayoutClient>
  );
}
