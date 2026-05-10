import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { toggleLike, getPostById, getUserById, createNotification } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await getPostById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post.likes || []);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { postId } = await params;
    const result = await toggleLike(postId, authUser.userId);
    if (result.liked) {
      const post = await getPostById(postId);
      if (post && post.authorId !== authUser.userId) {
        const me = await getUserById(authUser.userId);
        await createNotification({ recipientId: post.authorId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "like", postId, message: `${authUser.name} liked your post` });
      }
    }
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
