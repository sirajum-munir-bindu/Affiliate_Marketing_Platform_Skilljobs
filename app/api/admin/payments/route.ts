import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function DELETE(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deletePayment(id, session.email);
    return NextResponse.json({
      success: true,
      message: "পেমেন্ট রেকর্ড সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    const status =
      err.message === "UNAUTHORIZED" ? 401 : err.message === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json(
      { success: false, message: err.message || "পেমেন্ট ডিলিট ব্যর্থ হয়েছে" },
      { status }
    );
  }
}
