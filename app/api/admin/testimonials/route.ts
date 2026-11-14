import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const testimonials = await DataService.getTestimonials(false);
    return NextResponse.json({ success: true, data: testimonials });
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

    if (!body.name || !body.quoteBn || !body.roleBn) {
      return NextResponse.json(
        { success: false, message: "নাম, ভূমিকা (Role) এবং মন্তব্য (Quote) আবশ্যক।" },
        { status: 400 }
      );
    }

    const created = await DataService.createTestimonial(body, session.email);
    return NextResponse.json({
      success: true,
      message: "নতুন রিভিউ সফলভাবে যুক্ত করা হয়েছে!",
      data: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "রিভিউ যোগ করতে ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireRole(["ADMIN"]);
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "রিভিউ আইডি প্রদান করুন।" },
        { status: 400 }
      );
    }

    const updated = await DataService.updateTestimonial(id, updateData, session.email);
    return NextResponse.json({
      success: true,
      message: "রিভিউ সফলভাবে আপডেট করা হয়েছে!",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "রিভিউ আপডেট ব্যর্থ হয়েছে" },
      { status: 400 }
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
        { success: false, message: "রিভিউ আইডি প্রদান করুন।" },
        { status: 400 }
      );
    }

    await DataService.deleteTestimonial(id, session.email);
    return NextResponse.json({
      success: true,
      message: "রিভিউ সফলভাবে মুছে ফেলা হয়েছে!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "রিভিউ ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
