import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, getUserRecommendations } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ users: [] }, { status: 401 });
    const me = await getUserById(authUser.userId);
    const following = me?.following || [];
    const users = await getUserRecommendations(authUser.userId, following, 5);
    const safe = users.map(({ password: _pw, ...u }: any) => u);
    return NextResponse.json({ users: safe });
  } catch { return NextResponse.json({ users: [] }, { status: 500 }); }
}
