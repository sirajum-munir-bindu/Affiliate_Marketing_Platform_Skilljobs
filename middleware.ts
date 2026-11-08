import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "skilljobs-production-secret-jwt-key-2026-bangla-affiliate-platform";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("skilljobs_session")?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      session = payload;
    } catch {
      session = null;
    }
  }

  // Admin Routes Guard
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
  }

  // Affiliate Routes Guard (except /affiliate/apply)
  if (pathname.startsWith("/affiliate") && !pathname.startsWith("/affiliate/apply")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "AFFILIATE" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/affiliate/apply", req.url));
    }
  }

  // Student Routes Guard
  if (pathname.startsWith("/student")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Set 30-day affiliate attribution cookie if ref param exists
  const refCode = req.nextUrl.searchParams.get("ref");
  const response = NextResponse.next();
  if (refCode) {
    response.cookies.set("skilljobs_ref_attribution", refCode.trim().toUpperCase(), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/affiliate/:path*", "/student/:path*", "/courses/:path*"],
};
