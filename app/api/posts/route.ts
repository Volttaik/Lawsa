import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPosts, getUserById, createPost } from "@/lib/queries";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || "all";
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (category && category !== "all") filter.category = category;
    const posts = await getPosts(filter, skip, limit);
    const res = NextResponse.json({ posts, hasMore: posts.length === limit });
    res.headers.set("Cache-Control", "private, max-age=15, stale-while-revalidate=45");
    return res;
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const me = await getUserById(authUser.userId);
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { content, images, videos, category, poll } = await request.json();
    if (!content?.trim() && (!images?.length) && (!videos?.length))
      return NextResponse.json({ error: "Content required" }, { status: 400 });

    const savedImages: string[] = (images || []).filter(Boolean);
    const savedVideos: string[] = (videos || []).filter(Boolean);

    const post = await createPost({
      authorId: authUser.userId,
      authorName: authUser.name,
      authorUsername: authUser.username,
      authorImage: me.profileImage || "",
      content: content?.trim() || "",
      images: savedImages,
      videos: savedVideos,
      category: category || "general",
      poll: poll || null,
    });

    if (!post) return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
