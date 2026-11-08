import { cookies } from "next/headers";
import { prisma } from "../db/prisma";
import crypto from "crypto";

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

export interface TrackClickParams {
  referralCode: string;
  courseId?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  landingPage?: string;
}

export async function processAffiliateClick(params: TrackClickParams) {
  try {
    const { referralCode, courseId, ip, userAgent, referer, landingPage } = params;

    // 1. Look up marketer by referral code
    const marketer = await prisma.marketerProfile.findUnique({
      where: { referralCode },
      include: { user: true },
    });

    if (!marketer || marketer.status !== "APPROVED" || marketer.user.status !== "ACTIVE") {
      return { success: false, reason: "INVALID_OR_INACTIVE_AFFILIATE" };
    }

    // 2. Bot & basic rate limiting filter: check if this IP hashed already clicked this marketer's course within 10 minutes
    const ipHash = ip ? hashIp(ip) : null;
    if (ipHash) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentClick = await prisma.affiliateClick.findFirst({
        where: {
          marketerId: marketer.id,
          ipHash,
          courseId: courseId || null,
          createdAt: { gte: tenMinutesAgo },
        },
      });

      if (recentClick) {
        return { success: true, marketerId: marketer.id, referralCode };
      }
    }

    // 3. Atomically record click
    await prisma.$transaction(async (tx) => {
      await tx.affiliateClick.create({
        data: {
          marketerId: marketer.id,
          courseId: courseId || null,
          ipHash,
          userAgent: userAgent ? userAgent.slice(0, 255) : null,
          referer: referer ? referer.slice(0, 255) : null,
          landingPage: landingPage ? landingPage.slice(0, 255) : null,
        },
      });

      await tx.marketerProfile.update({
        where: { id: marketer.id },
        data: { totalClicks: { increment: 1 } },
      });

      if (courseId) {
        await tx.affiliateLink.updateMany({
          where: { marketerId: marketer.id, courseId },
          data: { clicksCount: { increment: 1 } },
        });
      }
    });

    return { success: true, marketerId: marketer.id, referralCode };
  } catch {
    // Safe mock fallback if database is not reachable
    try {
      const { mockDb } = await import("../db/mock-data");
      const m = mockDb.marketers.find(
        (marketer) => marketer.referralCode.toUpperCase() === params.referralCode.toUpperCase()
      );
      if (m && m.status === "APPROVED") {
        m.totalClicks = (m.totalClicks || 0) + 1;
        return { success: true, marketerId: m.id, referralCode: params.referralCode };
      }
    } catch {}
    return { success: false, reason: "MOCK_FALLBACK" };
  }
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
