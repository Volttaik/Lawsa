import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { Comment } from "@/models/comment.model";
import "@/models/comment.model";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    await connectDB();
    const post = await Post.findById(params.postId)
      .populate({ path: "comments", options: { sort: { createdAt: -1 }, limit: 5 } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post: JSON.parse(JSON.stringify(post)) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    await connectDB();
    const post = await Post.findById(params.postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== authUser.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    await Comment.deleteMany({ postId: params.postId });
    await Post.deleteOne({ _id: params.postId });
    return NextResponse.json({ message: "Post deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
