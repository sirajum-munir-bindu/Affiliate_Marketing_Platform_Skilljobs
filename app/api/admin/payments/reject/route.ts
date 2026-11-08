import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { paymentId, reason } = body;

    if (!paymentId || !reason) {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট আইডি এবং বাতিলের কারণ উল্লেখ করুন" },
        { status: 400 }
      );
    }

    const result = await DataService.rejectPayment(paymentId, reason, session.email);

    return NextResponse.json({
      success: true,
      message: "পেমেন্ট বাতিল করা হয়েছে। শিক্ষার্থী পুনরায় সঠিক TrxID জমা দিতে পারবে।",
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পেমেন্ট বাতিল প্রক্রিয়া ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
