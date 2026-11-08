import { NextRequest, NextResponse } from "next/server";
import { REF_COOKIE_NAME, ATTRIBUTION_DAYS } from "@/lib/affiliate/tracking";
import { DataService } from "@/lib/services/data-service";
import { mockDb } from "@/lib/db/mock-data";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.trim().toUpperCase();
  const url = new URL(req.url);
  const targetCourseSlug = url.searchParams.get("course");

  const marketer = await DataService.getMarketerByReferralCode(code);

  let redirectTarget = "/courses";
  if (targetCourseSlug) {
    redirectTarget = `/courses/${targetCourseSlug}`;
  }

  const response = NextResponse.redirect(new URL(redirectTarget, req.url));

  if (marketer && marketer.status === "APPROVED") {
    // Increment clicks
    marketer.totalClicks += 1;
    mockDb.clicks.push({
      id: `clk_${Date.now()}`,
      marketerId: marketer.id,
      landingPage: redirectTarget,
      createdAt: new Date().toISOString(),
    });

    // Set 30-day attribution cookie
    response.cookies.set(REF_COOKIE_NAME, code, {
      maxAge: ATTRIBUTION_DAYS * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
