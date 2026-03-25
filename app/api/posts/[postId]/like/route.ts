import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { User } from "@/models/user.model";
import { Notification } from "@/models/notification.model";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        await connectDB();
        const post = await Post.findById(params.postId);
        if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
        return NextResponse.json(post.likes || []);
    } catch {
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const authUser = await getUserFromRequest(req);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const post = await Post.findById(params.postId);
        if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

        const liked = post.likes?.includes(authUser.userId);
        if (liked) {
            post.likes = post.likes?.filter((id) => id !== authUser.userId);
        } else {
            post.likes?.push(authUser.userId);
            if (post.authorId !== authUser.userId) {
                const currentUser = await User.findById(authUser.userId).select("profileImage");
                await Notification.create({
                    recipientId: post.authorId,
                    senderId: authUser.userId,
                    senderName: authUser.name,
                    senderImage: currentUser?.profileImage || "",
                    type: "like",
                    postId: params.postId,
                    message: `${authUser.name} liked your post`,
                });
            }
        }
        await post.save();
        return NextResponse.json({ liked: !liked, likesCount: post.likes?.length || 0 });
    } catch {
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
