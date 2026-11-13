import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { applicationId, action, reason, targetStatus, channels, occupation, marketingExperience, approveNow } = body;

    if (!applicationId || !["APPROVE", "REJECT", "REVERT", "RESOLVE"].includes(action)) {
      return NextResponse.json({ success: false, message: "অবৈধ অ্যাকশন" }, { status: 400 });
    }

    if (action === "APPROVE") {
      const profile = await DataService.approveAffiliateApplication(applicationId, session.email);
      return NextResponse.json({
        success: true,
        message: "আবেদন সফলভাবে অনুমোদন করা হয়েছে এবং রেফারেল কোড সক্রিয় করা হয়েছে!",
        profile,
      });
    }

    if (action === "REJECT") {
      if (!reason?.trim()) {
        return NextResponse.json({ success: false, message: "বাতিলের কারণ উল্লেখ করুন" }, { status: 400 });
      }
      const app = await DataService.rejectAffiliateApplication(applicationId, reason.trim(), session.email);
      return NextResponse.json({
        success: true,
        message: "আবেদনটি বাতিল করা হয়েছে।",
        application: app,
      });
    }

    if (action === "REVERT") {
      const normalizedTarget = targetStatus === "REJECTED" ? "REJECTED" : "PENDING";
      const app = await DataService.revertAffiliateApplication(
        applicationId,
        { targetStatus: normalizedTarget, reason },
        session.email
      );
      return NextResponse.json({
        success: true,
        message:
          normalizedTarget === "REJECTED"
            ? "ভুল অনুমোদন রিভার্স করে আবেদনটি বাতিল করা হয়েছে।"
            : "অনুমোদন রিভার্স করে আবেদনটি আবার পেন্ডিং রিভিউতে পাঠানো হয়েছে।",
        application: app,
      });
    }

    // RESOLVE
    const result = await DataService.resolveRejectedAffiliateApplication(
      applicationId,
      {
        channels,
        occupation,
        marketingExperience,
        approveNow: Boolean(approveNow),
      },
      session.email
    );

    return NextResponse.json({
      success: true,
      message: approveNow
        ? "আবেদনটি সমাধান ও অনুমোদন করা হয়েছে এবং রেফারেল কোড সক্রিয় করা হয়েছে!"
        : "আবেদন আপডেট করে পেন্ডিং রিভিউতে পাঠানো হয়েছে।",
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "প্রক্রিয়া ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "আবেদন আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deleteAffiliateApplication(id, session.email);
    return NextResponse.json({
      success: true,
      message: "অ্যাফিলিয়েট আবেদন সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "আবেদন ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
