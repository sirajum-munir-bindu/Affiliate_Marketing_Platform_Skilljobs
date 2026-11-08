import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "পেমেন্ট আইডি প্রদান করুন" }, { status: 400 });
    }

    const result = await DataService.approvePayment(paymentId, session.email);

    return NextResponse.json({
      success: true,
      message: "পেমেন্ট সফলভাবে অনুমোদিত হয়েছে! কোর্স অ্যাক্সেস এবং কমিশন কার্যকর করা হয়েছে।",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পেমেন্ট অনুমোদন ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
