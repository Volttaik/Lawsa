import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPostById, deletePost } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await getPostById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { postId } = await params;
    const post = await getPostById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await deletePost(postId);
    return NextResponse.json({ message: "Deleted" });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
