import { NextRequest, NextResponse } from "next/server";
import {
  REF_COOKIE_NAME,
  ATTRIBUTION_DAYS,
  processAffiliateClick,
  extractRequestContext,
  isPrefetchRequest,
} from "@/lib/affiliate/tracking";

export async function POST(req: NextRequest) {
  try {
    if (isPrefetchRequest(req.headers)) {
      return NextResponse.json({ success: true, skipped: "prefetch" });
    }

    const body = await req.json();
    const referralCode = String(body.referralCode || "").trim().toUpperCase();
    const landingPage = typeof body.landingPage === "string" ? body.landingPage.trim() : "/";
    const courseId = typeof body.courseId === "string" ? body.courseId.trim() : undefined;
    const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug.trim() : undefined;

    if (!referralCode) {
      return NextResponse.json(
        { success: false, message: "Referral code required" },
        { status: 400 }
      );
    }

    const ctx = extractRequestContext(req.headers);
    const result = await processAffiliateClick({
      referralCode,
      courseId,
      courseSlug,
      landingPage: landingPage.startsWith("/") ? landingPage : "/",
      ...ctx,
    });

    const response = NextResponse.json({
      success: result.success,
      tracked: Boolean(result.success && !result.deduplicated),
      data: result,
    });

    if (result.success) {
      response.cookies.set(REF_COOKIE_NAME, result.referralCode || referralCode, {
        maxAge: ATTRIBUTION_DAYS * 24 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Click tracking failed" },
      { status: 400 }
    );
  }
}
