import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { paymentId, targetStatus, reason } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const normalizedTarget =
      targetStatus === "REJECTED" ? "REJECTED" : "SUBMITTED";

    const result = await DataService.revertPaymentApproval(
      paymentId,
      { targetStatus: normalizedTarget, reason },
      session.email
    );

    return NextResponse.json({
      success: true,
      message:
        normalizedTarget === "REJECTED"
          ? "ভুল অনুমোদন বাতিল করে পেমেন্টটি রিজেক্ট করা হয়েছে (কোর্স অ্যাক্সেস ও কমিশন রিভার্স করা হয়েছে)।"
          : "অনুমোদন রিভার্স করে পেমেন্টটি আবার পেন্ডিং রিভিউতে পাঠানো হয়েছে (কোর্স অ্যাক্সেস ও কমিশন রিভার্স করা হয়েছে)।",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "অনুমোদন রিভার্স প্রক্রিয়া ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
