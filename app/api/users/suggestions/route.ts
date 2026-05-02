import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { findUsers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ users: [] });
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const users = await findUsers("", 1, limit * 3, authUser.userId);
    // Filter out people already followed
    const suggestions = users
      .filter((u: any) => !(u.followers || []).includes(authUser.userId))
      .slice(0, limit)
      .map(({ password: _pw, ...u }: any) => u);
    return NextResponse.json({ users: suggestions });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
