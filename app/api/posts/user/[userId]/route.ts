import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        await connectDB();
        const posts = await Post.find({ authorId: params.userId }).sort({ createdAt: -1 });
        return NextResponse.json({ posts: JSON.parse(JSON.stringify(posts)) });
    } catch {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
