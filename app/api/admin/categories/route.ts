import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const categories = await DataService.getCategories();
    return NextResponse.json({ success: true, data: categories });
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

    if (!body.nameBn?.trim() && !body.name?.trim()) {
      return NextResponse.json(
        { success: false, message: "ক্যাটাগরির নাম প্রদান করুন" },
        { status: 400 }
      );
    }

    const category = await DataService.createCategory(
      {
        name: body.name,
        nameBn: body.nameBn || body.name,
        slug: body.slug,
      },
      session.email
    );

    return NextResponse.json({
      success: true,
      message: "নতুন ক্যাটাগরি সফলভাবে যুক্ত করা হয়েছে!",
      data: category,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে" },
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
        { success: false, message: "ক্যাটাগরি আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const updated = await DataService.updateCategory(id, updateData, session.email);
    return NextResponse.json({
      success: true,
      message: "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "ক্যাটাগরি আপডেট ব্যর্থ হয়েছে" },
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
        { success: false, message: "ক্যাটাগরি আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deleteCategory(id, session.email);
    return NextResponse.json({
      success: true,
      message: "ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "ক্যাটাগরি ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
