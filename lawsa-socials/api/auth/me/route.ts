import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUserLastOnline } from "@/lib/queries";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await getUserById(authUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await updateUserLastOnline(authUser.userId);
    const { password: _pw, ...safeUser } = user;
    const res = NextResponse.json({ user: safeUser });
    res.headers.set("Cache-Control", "private, max-age=10, stale-while-revalidate=30");
    return res;
  } catch (e) {
    console.error("[/api/auth/me]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
