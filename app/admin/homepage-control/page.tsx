import { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";
import { HomepageControlClient } from "./HomepageControlClient";

export const metadata: Metadata = {
  title: "হোমপেজ ভিডিও ও কাউন্টার কন্ট্রোল | Skilljobs Admin",
};

export default async function HomepageControlPage() {
  await requireRole(["ADMIN"]);

  const [settings, liveStats, analyticsData] = await Promise.all([
    DataService.getHomepageSettings(),
    DataService.getPlatformStats(),
    DataService.getAdminAnalyticsData(),
  ]);

  return (
    <HomepageControlClient
      initialSettings={settings}
      liveStats={liveStats}
      analyticsData={analyticsData}
    />
  );
}
