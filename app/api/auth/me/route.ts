import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DataService } from "@/lib/services/data-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await DataService.findUserById(session.userId);
  const marketer = await DataService.getMarketerByUserId(session.userId);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: user?.name || session.name,
      email: session.email,
      role: user?.role || session.role,
      status: user?.status || session.status,
      referralCode: marketer?.referralCode || session.referralCode,
      marketerId: marketer?.id,
    },
  });
}
