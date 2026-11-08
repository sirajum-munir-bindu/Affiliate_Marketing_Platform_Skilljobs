import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { payoutId, reference } = body;

    if (!payoutId || !reference) {
      return NextResponse.json(
        { success: false, message: "পে-আউট আইডি এবং bKash/Bank ট্রানজেকশন রেফারেন্স প্রদান করুন" },
        { status: 400 }
      );
    }

    const payout = await DataService.completePayout(payoutId, reference, session.email);

    return NextResponse.json({
      success: true,
      message: "পে-আউট সফলভাবে নিষ্পন্ন (PAID) হয়েছে!",
      payout,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পে-আউট নিষ্পত্তি ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
