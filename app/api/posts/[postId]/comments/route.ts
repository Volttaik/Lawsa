import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getCommentsByPostId, createComment, getPostById, getUserById, createNotification } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const comments = await getCommentsByPostId(postId, null);
    return NextResponse.json({ comments });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { postId } = await params;
    const { content, parentId } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
    const me = await getUserById(authUser.userId);
    const comment = await createComment({ postId, authorId: authUser.userId, authorName: authUser.name, authorUsername: authUser.username, authorImage: me?.profileImage || "", content: content.trim(), parentId: parentId || null });
    const post = await getPostById(postId);
    if (post && post.authorId !== authUser.userId) {
      await createNotification({ recipientId: post.authorId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "comment", postId, message: `${authUser.name} commented on your post` });
    }
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
