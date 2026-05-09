import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/queries";
import { cache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
