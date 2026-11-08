import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { AffiliateApplySchema } from "@/lib/validations";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = AffiliateApplySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const application = await DataService.submitAffiliateApplication({
      userId: session.userId,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      occupation: parsed.data.occupation,
      channels: parsed.data.channels,
      marketingExperience: parsed.data.marketingExperience,
      whyJoin: parsed.data.whyJoin,
    });

    return NextResponse.json({
      success: true,
      message: "আপনার আবেদন সফলভাবে জমা হয়েছে! ২৪ ঘণ্টার মধ্যে এডমিন টিম পর্যালোচনা করবে।",
      application,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "আবেদন ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
