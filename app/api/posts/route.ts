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
        const authUser = await getUserFromRequest(request);
        await connectDB();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const category = searchParams.get("category") || "all";
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (category && category !== "all") {
            filter.category = category;
        }

        let posts;
        let total;

        if (authUser) {
            const me = await User.findById(authUser.userId).select("following");
            const followingIds: string[] = me?.following || [];

            if (followingIds.length > 0 && page === 1 && category === "all") {
                const [followedPosts, otherPosts, totalCount] = await Promise.all([
                    Post.find({ ...filter, authorId: { $in: followingIds } })
                        .sort({ createdAt: -1 })
                        .limit(5)
                        .populate({ path: "comments", options: { sort: { createdAt: -1 } } }),
                    Post.find({ ...filter, authorId: { $nin: followingIds } })
                        .sort({ createdAt: -1 })
                        .limit(limit - 5)
                        .populate({ path: "comments", options: { sort: { createdAt: -1 } } }),
                    Post.countDocuments(filter),
                ]);
                posts = [...followedPosts, ...otherPosts];
                total = totalCount;
            } else {
                [posts, total] = await Promise.all([
                    Post.find(filter)
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .populate({ path: "comments", options: { sort: { createdAt: -1 } } }),
                    Post.countDocuments(filter),
                ]);
            }
        } else {
            [posts, total] = await Promise.all([
                Post.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate({ path: "comments", options: { sort: { createdAt: -1 } } }),
                Post.countDocuments(filter),
            ]);
        }

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
        const { content, images, videos, category } = await request.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const savedImages: string[] = [];
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

        const savedVideos: string[] = [];
        if (videos && Array.isArray(videos)) {
            for (const vid of videos) {
                if (vid.startsWith("/uploads/") || vid.startsWith("/api/files/")) {
                    savedVideos.push(vid);
                } else if (vid.startsWith("data:")) {
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
            category: category || "general",
        });

        return NextResponse.json({ post: JSON.parse(JSON.stringify(post)) }, { status: 201 });
    } catch (error) {
        console.error("Create post error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
