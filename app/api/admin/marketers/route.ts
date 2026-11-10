import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const marketers = await DataService.getAllMarketers();
    return NextResponse.json({ success: true, data: marketers });
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

    const name = body.name ?? body.userName;
    const email = body.email ?? body.userEmail;
    const phone = body.phone ?? body.userPhone;

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "মার্কেটারের নাম, ইমেইল এবং ফোন নম্বর আবশ্যক" },
        { status: 400 }
      );
    }

    const marketer = await DataService.createMarketer(
      {
        name,
        email,
        phone,
        password: body.password,
        referralCode: body.referralCode,
        status: body.status,
        occupation: body.occupation,
        experience: body.experience,
        channels: body.channels,
        whyJoin: body.whyJoin,
        payoutMethod: body.payoutMethod,
        payoutAccountNo: body.payoutAccountNo,
        currentBalance: body.currentBalance,
      },
      session.email
    );

    return NextResponse.json({
      success: true,
      message: "নতুন অ্যাফিলিয়েট মার্কেটার সফলভাবে যুক্ত করা হয়েছে!",
      data: marketer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "মার্কেটার তৈরি করতে ব্যর্থ হয়েছে" },
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
        { success: false, message: "মার্কেটার আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const updated = await DataService.updateMarketer(id, updateData, session.email);
    return NextResponse.json({
      success: true,
      message: "মার্কেটারের তথ্য সফলভাবে আপডেট করা হয়েছে!",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "মার্কেটার আপডেট ব্যর্থ হয়েছে" },
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
        { success: false, message: "মার্কেটার আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deleteMarketer(id, session.email);
    return NextResponse.json({
      success: true,
      message: "মার্কেটার সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "মার্কেটার ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
