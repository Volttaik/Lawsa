import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPosts, countPosts, getUserById, createPost } from "@/lib/queries";
import { saveBase64Media } from "@/lib/upload";
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
    const [posts, total] = await Promise.all([getPosts(filter, skip, limit), countPosts(filter)]);
    return NextResponse.json({ posts, total, hasMore: skip + limit < total });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { content, images, videos, category, poll } = await request.json();
    if (!content?.trim() && (!images?.length) && (!videos?.length)) return NextResponse.json({ error: "Content required" }, { status: 400 });
    const me = await getUserById(authUser.userId);
    const savedImages: string[] = [];
    for (const img of (images || [])) {
      if (img.startsWith("data:")) savedImages.push(await saveBase64Media(img, "posts"));
      else if (img) savedImages.push(img);
    }
    const savedVideos: string[] = [];
    for (const vid of (videos || [])) {
      if (vid.startsWith("data:")) savedVideos.push(await saveBase64Media(vid, "posts"));
      else if (vid) savedVideos.push(vid);
    }
    const post = await createPost({ authorId: authUser.userId, authorName: authUser.name, authorUsername: authUser.username, authorImage: me?.profileImage || "", content: content?.trim() || "", images: savedImages, videos: savedVideos, category: category || "general", poll: poll || null });
    if (!post) return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
