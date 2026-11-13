import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const commissions = await DataService.getAllCommissions();
    return NextResponse.json({ success: true, data: commissions });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "কমিশন আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deleteCommission(id, session.email);
    return NextResponse.json({
      success: true,
      message: "কমিশন রেকর্ড সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "কমিশন ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
