import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { REF_COOKIE_NAME } from "@/lib/affiliate/tracking";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "অর্ডার করতে অনুগ্রহ করে লগইন করুন।" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ success: false, message: "কোর্স আইডি আবশ্যক" }, { status: 400 });
    }

    // Get referral attribution from cookie
    const cookieStore = cookies();
    const refCode = cookieStore.get(REF_COOKIE_NAME)?.value || body.refCode || null;

    const order = await DataService.createOrder({
      customerId: session.userId,
      courseId,
      refCode,
    });

    return NextResponse.json({
      success: true,
      message: "অর্ডার সফলভাবে তৈরি হয়েছে! অনুগ্রহ করে bKash পেমেন্ট সম্পন্ন করুন।",
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "অর্ডার তৈরিতে ত্রুটি হয়েছে" },
      { status: 400 }
    );
  }
}
