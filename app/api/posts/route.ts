import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { User } from "@/models/user.model";
import "@/models/comment.model";
import { saveBase64Media } from "@/lib/upload";

export const dynamic = "force-dynamic";

async function weightedRandomPosts(
  filter: Record<string, unknown>,
  skip: number,
  limit: number
) {
  const scored = await Post.aggregate([
    { $match: filter },
    {
      $addFields: {
        _score: {
          $multiply: [
            { $rand: {} },
            { $pow: [{ $add: [{ $size: "$likes" }, 1] }, 0.65] },
          ],
        },
      },
    },
    { $sort: { _score: -1 } },
    { $skip: skip },
    { $limit: limit },
    { $project: { _id: 1 } },
  ]);
  const ids = scored.map((p: { _id: unknown }) => p._id);
  const populated = await Post.find({ _id: { $in: ids } })
    .populate({ path: "comments", options: { sort: { createdAt: -1 } } })
    .lean();
  const idMap = new Map(ids.map((id: unknown, i: number) => [String(id), i]));
  populated.sort(
    (a, b) => (idMap.get(String(a._id)) ?? 0) - (idMap.get(String(b._id)) ?? 0)
  );
  return populated;
}

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
    const total = await Post.countDocuments(filter);

    if (authUser && page === 1 && category === "all") {
      const me = await User.findById(authUser.userId).select("following");
      const followingIds: string[] = me?.following || [];

      if (followingIds.length > 0) {
        const followedCount = Math.min(5, limit);
        const otherCount = limit - followedCount;
        const [followedPosts, otherPosts] = await Promise.all([
          weightedRandomPosts({ ...filter, authorId: { $in: followingIds } }, 0, followedCount),
          weightedRandomPosts({ ...filter, authorId: { $nin: followingIds } }, 0, otherCount),
        ]);
        posts = [...followedPosts, ...otherPosts];
      } else {
        posts = await weightedRandomPosts(filter, skip, limit);
      }
    } else {
      posts = await weightedRandomPosts(filter, skip, limit);
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
