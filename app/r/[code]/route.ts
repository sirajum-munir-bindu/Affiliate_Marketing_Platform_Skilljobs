import { NextRequest, NextResponse } from "next/server";
import {
  REF_COOKIE_NAME,
  ATTRIBUTION_DAYS,
  processAffiliateClick,
  extractRequestContext,
  isPrefetchRequest,
} from "@/lib/affiliate/tracking";
import { DataService } from "@/lib/services/data-service";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.trim().toUpperCase();
  const url = new URL(req.url);
  const targetCourseSlug = url.searchParams.get("course")?.trim() || undefined;

  const course = targetCourseSlug
    ? await DataService.getCourseBySlug(targetCourseSlug)
    : null;

  const redirectTarget = course
    ? `/courses/${course.slug}`
    : targetCourseSlug
    ? `/courses/${targetCourseSlug}`
    : "/courses";

  const response = NextResponse.redirect(new URL(redirectTarget, req.url));

  if (!isPrefetchRequest(req.headers)) {
    const ctx = extractRequestContext(req.headers);
    const result = await processAffiliateClick({
      referralCode: code,
      courseId: course?.id,
      courseSlug: targetCourseSlug,
      landingPage: redirectTarget,
      ...ctx,
    });

    if (result.success) {
      response.cookies.set(REF_COOKIE_NAME, result.referralCode || code, {
        maxAge: ATTRIBUTION_DAYS * 24 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }
  }

  return response;
}
