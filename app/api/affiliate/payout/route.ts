import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { PayoutRequestSchema } from "@/lib/validations";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["AFFILIATE"]);
    const marketer = await DataService.getMarketerByUserId(session.userId);

    if (!marketer || marketer.status !== "APPROVED") {
      return NextResponse.json({ success: false, message: "অননুমোদিত অ্যাফিলিয়েট অ্যাকাউন্ট" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PayoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const payout = await DataService.requestPayout({
      marketerId: marketer.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      destinationNumber: parsed.data.destinationNumber,
    });

    return NextResponse.json({
      success: true,
      message: `৳${payout.amount} টাকা উত্তোলনের আবেদন জমা হয়েছে। এডমিন ভেরিফিকেশনের পর পেমেন্ট সম্পন্ন হবে।`,
      payout,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "উত্তোলন আবেদন ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
