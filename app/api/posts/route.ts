import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { User } from "@/models/user.model";
import "@/models/comment.model";
import { saveBase64Media } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "comments", options: { sort: { createdAt: -1 } } });

        const total = await Post.countDocuments();
        return NextResponse.json({
            posts: JSON.parse(JSON.stringify(posts)),
            total,
            hasMore: skip + limit < total,
        });
    } catch (error) {
        console.error("Get posts error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        await connectDB();
        const { content, images, videos } = await request.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        let savedImages: string[] = [];
        if (images && Array.isArray(images)) {
            for (const img of images) {
                if (img.startsWith("data:")) {
                    const url = await saveBase64Media(img, "posts");
                    savedImages.push(url);
                } else {
                    savedImages.push(img);
                }
            }
        }

        let savedVideos: string[] = [];
        if (videos && Array.isArray(videos)) {
            for (const vid of videos) {
                if (vid.startsWith("data:")) {
                    const url = await saveBase64Media(vid, "posts");
                    savedVideos.push(url);
                } else {
                    savedVideos.push(vid);
                }
            }
        }

        const currentUser = await User.findById(authUser.userId).select("profileImage");
        const post = await Post.create({
            authorId: authUser.userId,
            authorName: authUser.name,
            authorUsername: authUser.username,
            authorImage: currentUser?.profileImage || "",
            content: content.trim(),
            images: savedImages,
            videos: savedVideos,
            likes: [],
            comments: [],
            shares: [],
        });

        return NextResponse.json({ post: JSON.parse(JSON.stringify(post)) }, { status: 201 });
    } catch (error) {
        console.error("Create post error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
