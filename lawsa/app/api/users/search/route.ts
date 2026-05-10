import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { findUsers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const users = await findUsers(q, 1, limit, authUser?.userId || "");
    const safe = users.map(({ password: _pw, ...u }: any) => u);
    return NextResponse.json({ users: safe });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
