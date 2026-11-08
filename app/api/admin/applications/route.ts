import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { applicationId, action, reason } = body;

    if (!applicationId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ success: false, message: "অবৈধ অ্যাকশন" }, { status: 400 });
    }

    if (action === "APPROVE") {
      const profile = await DataService.approveAffiliateApplication(applicationId, session.email);
      return NextResponse.json({
        success: true,
        message: "আবেদন সফলভাবে অনুমোদন করা হয়েছে এবং রেফারেল কোড সক্রিয় করা হয়েছে!",
        profile,
      });
    } else {
      if (!reason) {
        return NextResponse.json({ success: false, message: "বাতিলের কারণ উল্লেখ করুন" }, { status: 400 });
      }
      const app = await DataService.rejectAffiliateApplication(applicationId, reason, session.email);
      return NextResponse.json({
        success: true,
        message: "আবেদনটি বাতিল করা হয়েছে।",
        application: app,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "প্রক্রিয়া ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
