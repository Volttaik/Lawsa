import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { addReaction } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { postId } = await params;
    const { emoji } = await request.json();
    if (!emoji) return NextResponse.json({ error: "Emoji required" }, { status: 400 });
    const reactions = await addReaction(postId, authUser.userId, emoji);
    return NextResponse.json({ reactions });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
