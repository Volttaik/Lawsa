import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { Comment } from "@/models/comment.model";

export const dynamic = "force-dynamic";

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
