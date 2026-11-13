import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const payouts = await DataService.getAllPayouts();
    return NextResponse.json({ success: true, data: payouts });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { payoutId, action, reference, reason, targetStatus, destinationNumber, approveNow } = body;

    if (!payoutId || !["APPROVE", "REJECT", "REVERT", "RESOLVE"].includes(action)) {
      return NextResponse.json({ success: false, message: "অবৈধ অ্যাকশন" }, { status: 400 });
    }

    if (action === "APPROVE") {
      if (!reference?.trim()) {
        return NextResponse.json(
          { success: false, message: "bKash/Bank ট্রানজেকশন রেফারেন্স প্রদান করুন" },
          { status: 400 }
        );
      }
      const payout = await DataService.completePayout(payoutId, reference.trim(), session.email);
      return NextResponse.json({
        success: true,
        message: "পে-আউট সফলভাবে অনুমোদন ও নিষ্পত্তি (PAID) করা হয়েছে!",
        payout,
      });
    }

    if (action === "REJECT") {
      if (!reason?.trim()) {
        return NextResponse.json(
          { success: false, message: "বাতিলের কারণ উল্লেখ করুন" },
          { status: 400 }
        );
      }
      const payout = await DataService.rejectPayout(payoutId, reason.trim(), session.email);
      return NextResponse.json({
        success: true,
        message: "পে-আউট রিকোয়েস্ট বাতিল করা হয়েছে এবং ব্যালেন্স মার্কেটারের একাউন্টে ফেরত দেওয়া হয়েছে।",
        payout,
      });
    }

    if (action === "REVERT") {
      const normalizedTarget = targetStatus === "REJECTED" ? "REJECTED" : "REQUESTED";
      const payout = await DataService.revertPayoutApproval(
        payoutId,
        { targetStatus: normalizedTarget, reason },
        session.email
      );
      return NextResponse.json({
        success: true,
        message:
          normalizedTarget === "REJECTED"
            ? "ভুল পে-আউট অনুমোদন রিভার্স করে বাতিল করা হয়েছে এবং ব্যালেন্স ফেরত দেওয়া হয়েছে।"
            : "পে-আউট অনুমোদন রিভার্স করে অপেক্ষমাণ (REQUESTED) তালিকায় ফেরত পাঠানো হয়েছে।",
        payout,
      });
    }

    // RESOLVE
    const payout = await DataService.resolveRejectedPayout(
      payoutId,
      {
        destinationNumber,
        reference,
        approveNow: Boolean(approveNow),
      },
      session.email
    );

    return NextResponse.json({
      success: true,
      message: approveNow
        ? "সমস্যা সমাধান করে পে-আউট অনুমোদন (PAID) করা হয়েছে!"
        : "সংশোধিত তথ্য আপডেট করে অপেক্ষমাণ তালিকায় ফেরত পাঠানো হয়েছে।",
      payout,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পে-আউট প্রক্রিয়া ব্যর্থ হয়েছে" },
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
        { success: false, message: "পে-আউট আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deletePayout(id, session.email);
    return NextResponse.json({
      success: true,
      message: "পে-আউট রেকর্ড সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পে-আউট ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
