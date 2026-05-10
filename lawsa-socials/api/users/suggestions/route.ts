import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, findUsers } from "@/lib/queries";
import { cache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ users: [] });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const cacheKey = `suggestions:${authUser.userId}:${limit}`;
    const cached = cache.get<any[]>(cacheKey);
    if (cached !== null) {
      const res = NextResponse.json({ users: cached });
      res.headers.set("Cache-Control", "private, max-age=60");
      return res;
    }

    const me = await getUserById(authUser.userId);
    const following: string[] = me?.following || [];
    const exclude = new Set([authUser.userId, ...following]);

    const users = await findUsers("", 1, limit + exclude.size + 5, authUser.userId);
    const suggestions = users
      .filter((u: any) => !exclude.has(u.id))
      .slice(0, limit)
      .map(({ password: _pw, ...u }: any) => u);

    cache.set(cacheKey, suggestions, 60);
    const res = NextResponse.json({ users: suggestions });
    res.headers.set("Cache-Control", "private, max-age=60");
    return res;
  } catch {
    return NextResponse.json({ users: [] });
  }
}
