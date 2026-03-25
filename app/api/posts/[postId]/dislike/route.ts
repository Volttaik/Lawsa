import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    try {
        const authUser = await getUserFromRequest(req);
        if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        await connectDB();
        const post = await Post.findById(params.postId);
        if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
        post.likes = post.likes?.filter((id) => id !== authUser.userId);
        await post.save();
        return NextResponse.json({ message: "Post unliked." });
    } catch {
        return NextResponse.json({ error: "An error occurred." }, { status: 500 });
    }
}
