import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getNotifications, markNotificationsRead } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const notifications = await getNotifications(authUser.userId, 50);
    const res = NextResponse.json({ notifications });
    res.headers.set("Cache-Control", "private, max-age=5, stale-while-revalidate=15");
    return res;
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    await markNotificationsRead(authUser.userId);
    return NextResponse.json({ message: "All marked as read" });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
