import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { PaymentSubmitSchema } from "@/lib/validations";
import { DataService } from "@/lib/services/data-service";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PaymentSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const payment = await DataService.submitPayment({
      orderId: parsed.data.orderId,
      senderNumber: parsed.data.senderNumber,
      transactionId: parsed.data.transactionId,
      customerNote: parsed.data.customerNote,
    });

    return NextResponse.json({
      success: true,
      message: "পেমেন্ট তথ্য সফলভাবে জমা দেওয়া হয়েছে! এডমিন ভেরিফিকেশনের পর কোর্স অ্যাক্সেস সক্রিয় হবে।",
      payment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "পেমেন্ট তথ্য জমার ব্যর্থতা" },
      { status: 400 }
    );
  }
}
