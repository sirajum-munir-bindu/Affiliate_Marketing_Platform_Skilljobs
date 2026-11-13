import { cookies } from "next/headers";
import crypto from "crypto";
import { mockDb, MockAffiliateClick } from "../db/mock-data";

export const REF_COOKIE_NAME = "skilljobs_ref_attribution";
export const ATTRIBUTION_DAYS = 30;

export function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "AFF";
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${cleanName}${randomSuffix}`;
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "skilljobs_salt_2026").digest("hex").slice(0, 16);
}

export function isPrefetchRequest(headerGetter: { get(name: string): string | null }): boolean {
  const nextPrefetch = headerGetter.get("next-router-prefetch");
  const middlewarePrefetch = headerGetter.get("x-middleware-prefetch");
  const purpose = (headerGetter.get("purpose") || headerGetter.get("sec-purpose") || "").toLowerCase();
  return Boolean(nextPrefetch || middlewarePrefetch || purpose.includes("prefetch"));
}

export function extractRequestContext(headerGetter: { get(name: string): string | null }) {
  const forwarded = headerGetter.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerGetter.get("x-real-ip")?.trim() || undefined;
  const userAgent = headerGetter.get("user-agent") || undefined;
  const referer = headerGetter.get("referer") || undefined;
  return { ip, userAgent, referer };
}

export function parseDeviceType(userAgent?: string): string {
  if (!userAgent) return "ওয়েব ব্রাউজার";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "ট্যাবলেট";
  if (/mobile|iphone|ipod|android/.test(ua)) return "মোবাইল";
  if (/windows|macintosh|linux/.test(ua)) return "ডেস্কটপ";
  return "ওয়েব ব্রাউজার";
}

export function parseRefererSource(referer?: string): string {
  if (!referer) return "ডিরেক্ট ভিজিট";
  try {
    const host = new URL(referer).hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("facebook.com") || host === "fb.com" || host === "l.facebook.com") return "Facebook";
    if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("whatsapp.com") || host === "wa.me") return "WhatsApp";
    if (host === "t.me" || host.includes("telegram.")) return "Telegram";
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("google.")) return "Google Search";
    if (host === "localhost" || host === "127.0.0.1") return "প্ল্যাটফর্ম ইন্টারনাল";
    return host || "ডিরেক্ট ভিজিট";
  } catch {
    return "ডিরেক্ট ভিজিট";
  }
}

export interface TrackClickParams {
  referralCode: string;
  courseId?: string;
  courseSlug?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  landingPage?: string;
  dedupeWindowMs?: number;
}

export async function processAffiliateClick(params: TrackClickParams) {
  const cleanCode = params.referralCode?.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, reason: "INVALID_REFERRAL_CODE" as const };
  }

  const marketer = mockDb.marketers.find(
    (m) => m.referralCode.toUpperCase() === cleanCode
  );
  if (!marketer || marketer.status !== "APPROVED") {
    return { success: false, reason: "INVALID_OR_INACTIVE_AFFILIATE" as const };
  }

  const user = mockDb.users.find((u) => u.id === marketer.userId);
  if (user && user.status !== "ACTIVE") {
    return { success: false, reason: "INACTIVE_USER" as const };
  }

  const course = params.courseId
    ? mockDb.courses.find((c) => c.id === params.courseId)
    : params.courseSlug
    ? mockDb.courses.find((c) => c.slug === params.courseSlug)
    : undefined;

  const landingPage =
    params.landingPage || (course ? `/courses/${course.slug}` : "/courses");
  const ipHash = params.ip ? hashIp(params.ip) : undefined;
  const dedupeWindowMs = params.dedupeWindowMs ?? 2000;

  if (ipHash && dedupeWindowMs > 0) {
    const cutoff = Date.now() - dedupeWindowMs;
    const recentClick = mockDb.clicks.find(
      (c) =>
        c.marketerId === marketer.id &&
        c.ipHash === ipHash &&
        c.landingPage === landingPage &&
        new Date(c.createdAt).getTime() >= cutoff
    );
    if (recentClick) {
      return {
        success: true,
        deduplicated: true,
        marketerId: marketer.id,
        referralCode: marketer.referralCode,
        click: recentClick,
      };
    }
  }

  const click: MockAffiliateClick = {
    id: `clk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    marketerId: marketer.id,
    courseId: course?.id,
    courseTitleBn: course?.titleBn,
    landingPage,
    ipHash,
    userAgent: params.userAgent ? params.userAgent.slice(0, 255) : undefined,
    deviceType: parseDeviceType(params.userAgent),
    referer: parseRefererSource(params.referer),
    createdAt: new Date().toISOString(),
  };

  mockDb.clicks.unshift(click);
  marketer.totalClicks = (marketer.totalClicks || 0) + 1;

  return {
    success: true,
    deduplicated: false,
    marketerId: marketer.id,
    referralCode: marketer.referralCode,
    click,
  };
}

export async function setAttributionCookie(referralCode: string) {
  try {
    const cookieStore = cookies();
    const maxAge = ATTRIBUTION_DAYS * 24 * 60 * 60; // 30 days in seconds

    cookieStore.set(REF_COOKIE_NAME, referralCode, {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  } catch {
    // Graceful fallback when cookies() is called in a read-only context (e.g. Server Component page render)
  }
}

export async function getAttributedReferralCode(): Promise<string | null> {
  const cookieStore = cookies();
  const refCode = cookieStore.get(REF_COOKIE_NAME)?.value;
  return refCode || null;
}
