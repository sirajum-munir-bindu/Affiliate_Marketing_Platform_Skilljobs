import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const [settings, liveStats, analyticsData] = await Promise.all([
      DataService.getHomepageSettings(),
      DataService.getPlatformStats(),
      DataService.getAdminAnalyticsData(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        liveStats,
        analyticsData,
      },
    });
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

    const updated = await DataService.updateHomepageSettings(body, session.email);
    const [liveStats, analyticsData] = await Promise.all([
      DataService.getPlatformStats(),
      DataService.getAdminAnalyticsData(),
    ]);

    return NextResponse.json({
      success: true,
      message: "হোমপেজ ও ড্যাশবোর্ড সেটিংস সফলভাবে আপডেট করা হয়েছে!",
      data: {
        settings: updated,
        liveStats,
        analyticsData,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "সেটিংস আপডেট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
