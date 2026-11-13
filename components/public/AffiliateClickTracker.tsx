"use client";

import { useEffect } from "react";

export function AffiliateClickTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim().toUpperCase();
    if (!ref) return;

    const pathname = window.location.pathname || "/";
    // /courses and /courses/[slug] already track referral clicks server-side
    if (pathname === "/courses" || pathname.startsWith("/courses/")) {
      return;
    }

    const storageKey = `skilljobs_tracked_ref_${ref}_${pathname}`;
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }
    window.sessionStorage.setItem(storageKey, "1");

    fetch("/api/affiliate/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referralCode: ref,
        landingPage: pathname,
      }),
    }).catch(() => {});
  }, []);

  return null;
}
