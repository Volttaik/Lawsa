import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { toggleBookmark } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { postId } = await params;
    const result = await toggleBookmark(postId, authUser.userId);
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
