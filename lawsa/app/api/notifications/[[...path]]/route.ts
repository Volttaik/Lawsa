import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getNotifications, markNotificationsRead, countUnreadNotifications, markNotificationRead, deleteNotification } from "@/lib/queries";
import { cache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const segment = path[0];

  if (!segment || segment === "") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const notifications = await getNotifications(authUser.userId, 50);
      const res = NextResponse.json({ notifications });
      res.headers.set("Cache-Control", "private, max-age=5, stale-while-revalidate=15");
      return res;
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  if (segment === "count") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ count: 0 });
      const cacheKey = `notif-count:${authUser.userId}`;
      const cached = cache.get<number>(cacheKey);
      if (cached !== null) {
        const res = NextResponse.json({ count: cached });
        res.headers.set("Cache-Control", "private, max-age=15");
        return res;
      }
      const count = await countUnreadNotifications(authUser.userId);
      cache.set(cacheKey, count, 15);
      const res = NextResponse.json({ count });
      res.headers.set("Cache-Control", "private, max-age=15");
      return res;
    } catch { return NextResponse.json({ count: 0 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const segment = path[0];

  if (!segment || segment === "") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      await markNotificationsRead(authUser.userId);
      return NextResponse.json({ message: "All marked as read" });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  const id = segment;
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    await markNotificationRead(id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const id = path[0];
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    await deleteNotification(id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
