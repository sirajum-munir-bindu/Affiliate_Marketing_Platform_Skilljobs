import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const courses = await DataService.getCourses(false);
    return NextResponse.json({ success: true, data: courses });
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

    if (!body.titleBn && !body.title) {
      return NextResponse.json(
        { success: false, message: "কোর্সের নাম (Title) আবশ্যক" },
        { status: 400 }
      );
    }

    if (body.price === undefined || Number(body.price) < 0) {
      return NextResponse.json(
        { success: false, message: "সঠিক কোর্স মূল্য প্রদান করুন" },
        { status: 400 }
      );
    }

    const course = await DataService.createCourse(body, session.email);
    return NextResponse.json({
      success: true,
      message: "নতুন কোর্স সফলভাবে তৈরি করা হয়েছে!",
      data: course,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "কোর্স তৈরি করতে ব্যর্থ হয়েছে" },
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
        { success: false, message: "কোর্স আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const updated = await DataService.updateCourse(id, updateData, session.email);
    return NextResponse.json({
      success: true,
      message: "কোর্সের তথ্য সফলভাবে আপডেট করা হয়েছে!",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "কোর্স আপডেট ব্যর্থ হয়েছে" },
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
        { success: false, message: "কোর্স আইডি প্রদান করুন" },
        { status: 400 }
      );
    }

    const deleted = await DataService.deleteCourse(id, session.email);
    return NextResponse.json({
      success: true,
      message: "কোর্স সফলভাবে ডিলিট করা হয়েছে!",
      data: deleted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "কোর্স ডিলিট ব্যর্থ হয়েছে" },
      { status: 400 }
    );
  }
}
