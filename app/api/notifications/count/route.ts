import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ count: 0 });
    const count = await countUnreadNotifications(authUser.userId);
    return NextResponse.json({ count });
  } catch { return NextResponse.json({ count: 0 }); }
}
