import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPostById, getUserById, repostPost } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { postId } = await params;
    const [original, me] = await Promise.all([getPostById(postId), getUserById(authUser.userId)]);
    if (!original) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (original.repostedFrom) return NextResponse.json({ error: "Cannot repost a repost" }, { status: 400 });
    const result = await repostPost(original, me);
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
