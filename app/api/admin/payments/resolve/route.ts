import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { paymentId, transactionId, senderNumber, approveNow } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const result = await DataService.resolveRejectedPayment(
      paymentId,
      {
        transactionId,
        senderNumber,
        approveNow: Boolean(approveNow),
      },
      session.email
    );

    return NextResponse.json({
      success: true,
      message: approveNow
        ? "সমস্যা সমাধান করে পেমেন্ট অনুমোদন করা হয়েছে! কোর্স অ্যাক্সেস ও কমিশন কার্যকর হয়েছে।"
        : "সংশোধিত ট্রানজেকশন তথ্য আপডেট করে পেন্ডিং রিভিউতে পাঠানো হয়েছে।",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পেমেন্ট সমাধান প্রক্রিয়া ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
