import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { User } from "@/models/user.model";
import { Comment } from "@/models/comment.model";
import { Notification } from "@/models/notification.model";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        await connectDB();
        const comments = await Comment.find({ postId: params.postId, parentId: null })
            .sort({ createdAt: -1 });
        return NextResponse.json({ comments: JSON.parse(JSON.stringify(comments)) });
    } catch {
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const authUser = await getUserFromRequest(req);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const { content, parentId } = await req.json();
        if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

        const post = await Post.findById(params.postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        const currentUser = await User.findById(authUser.userId).select("profileImage");
        const authorImage = currentUser?.profileImage || "";

        const comment = await Comment.create({
            postId: params.postId,
            authorId: authUser.userId,
            authorName: authUser.name,
            authorUsername: authUser.username,
            authorImage,
            content: content.trim(),
            parentId: parentId || null,
            likes: [],
        });

        if (!parentId) {
            post.comments?.push(comment._id as any);
            await post.save();
        }

        if (post.authorId !== authUser.userId) {
            await Notification.create({
                recipientId: post.authorId,
                senderId: authUser.userId,
                senderName: authUser.name,
                senderImage: authorImage,
                type: parentId ? "reply" : "comment",
                postId: params.postId,
                commentId: comment._id.toString(),
                message: `${authUser.name} commented on your post`,
            });
        }

        return NextResponse.json({ comment: JSON.parse(JSON.stringify(comment)) }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
