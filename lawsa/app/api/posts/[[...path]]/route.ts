import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  getPosts, getUserById, createPost, getPostById, deletePost,
  toggleLike, toggleBookmark, addReaction, repostPost,
  getCommentsByPostId, createComment, createNotification,
  getStories, createStory, getStoriesByUser,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1, seg2] = path;

  // GET /api/posts (feed)
  if (!seg0) {
    try {
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

  // GET /api/posts/stream (SSE)
  if (seg0 === "stream") {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return new Response("Not authenticated", { status: 401 });
    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
        };
        const [snapshot, me] = await Promise.all([getPosts({}, 0, 15), getUserById(authUser.userId)]);
        send({ type: "snapshot", posts: snapshot, me });
        const timer = setInterval(async () => {
          if (closed) { clearInterval(timer); return; }
          const [posts, refreshedMe] = await Promise.all([getPosts({}, 0, 15), getUserById(authUser.userId)]);
          send({ type: "update", posts, me: refreshedMe });
        }, 15000);
        const keepAlive = setInterval(() => {
          if (!closed) { try { controller.enqueue(encoder.encode(`: keep-alive\n\n`)); } catch {} }
        }, 20000);
        request.signal.addEventListener("abort", () => {
          closed = true; clearInterval(timer); clearInterval(keepAlive);
          try { controller.close(); } catch {}
        });
      },
      cancel() { closed = true; },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
  }

  // GET /api/posts/user/[userId]
  if (seg0 === "user" && seg1) {
    try {
      const posts = await getPosts({ authorId: seg1 }, 0, 50);
      return NextResponse.json({ posts });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // GET /api/posts/stories
  if (seg0 === "stories" && !seg1) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const stories = await getStories();
      const grouped: Record<string, any> = {};
      for (const s of stories) {
        if (!s) continue;
        if (!grouped[s.authorId]) grouped[s.authorId] = { authorId: s.authorId, authorName: s.authorName, authorUsername: s.authorUsername, authorImage: s.authorImage || "", stories: [] };
        grouped[s.authorId].stories.push(s);
      }
      return NextResponse.json({ groups: Object.values(grouped) });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // GET /api/posts/stories/user/[userId]
  if (seg0 === "stories" && seg1 === "user" && seg2) {
    try {
      const stories = await getStoriesByUser(seg2);
      return NextResponse.json({ stories });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // At this point seg0 is a postId
  const postId = seg0;

  // GET /api/posts/[postId]
  if (!seg1) {
    try {
      const post = await getPostById(postId);
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json({ post });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // GET /api/posts/[postId]/like
  if (seg1 === "like") {
    try {
      const post = await getPostById(postId);
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json(post.likes || []);
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // GET /api/posts/[postId]/comments
  if (seg1 === "comments") {
    try {
      const comments = await getCommentsByPostId(postId, null);
      return NextResponse.json({ comments });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // POST /api/posts (create post)
  if (!seg0) {
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
      const post = await createPost({ authorId: authUser.userId, authorName: authUser.name, authorUsername: authUser.username, authorImage: me.profileImage || "", content: content?.trim() || "", images: savedImages, videos: savedVideos, category: category || "general", poll: poll || null });
      if (!post) return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
      return NextResponse.json({ post }, { status: 201 });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/posts/stories (create story)
  if (seg0 === "stories") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { content, image } = await request.json();
      if (!content?.trim() && !image) return NextResponse.json({ error: "Content or image required" }, { status: 400 });
      const me = await getUserById(authUser.userId);
      const story = await createStory({ authorId: authUser.userId, authorName: authUser.name, authorUsername: authUser.username, authorImage: me?.profileImage || "", content: content?.trim() || "", image: image || "" });
      if (!story) return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
      return NextResponse.json({ story }, { status: 201 });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  const postId = seg0;

  // POST /api/posts/[postId]/like
  if (seg1 === "like") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const result = await toggleLike(postId, authUser.userId);
      if (result.liked) {
        const post = await getPostById(postId);
        if (post && post.authorId !== authUser.userId) {
          const me = await getUserById(authUser.userId);
          await createNotification({ recipientId: post.authorId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "like", postId, message: `${authUser.name} liked your post` });
        }
      }
      return NextResponse.json(result);
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/posts/[postId]/dislike
  if (seg1 === "dislike") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      await toggleLike(postId, authUser.userId);
      return NextResponse.json({ message: "Updated" });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/posts/[postId]/bookmark
  if (seg1 === "bookmark") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const result = await toggleBookmark(postId, authUser.userId);
      return NextResponse.json(result);
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/posts/[postId]/react
  if (seg1 === "react") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { emoji } = await request.json();
      if (!emoji) return NextResponse.json({ error: "Emoji required" }, { status: 400 });
      const reactions = await addReaction(postId, authUser.userId, emoji);
      return NextResponse.json({ reactions });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/posts/[postId]/repost
  if (seg1 === "repost") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const [original, me] = await Promise.all([getPostById(postId), getUserById(authUser.userId)]);
      if (!original) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (original.repostedFrom) return NextResponse.json({ error: "Cannot repost a repost" }, { status: 400 });
      const result = await repostPost(original, me);
      return NextResponse.json(result);
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/posts/[postId]/comments
  if (seg1 === "comments") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { content, parentId } = await request.json();
      if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
      const me = await getUserById(authUser.userId);
      const comment = await createComment({ postId, authorId: authUser.userId, authorName: authUser.name, authorUsername: authUser.username, authorImage: me?.profileImage || "", content: content.trim(), parentId: parentId || null });
      const post = await getPostById(postId);
      if (post && post.authorId !== authUser.userId) {
        await createNotification({ recipientId: post.authorId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "comment", postId, message: `${authUser.name} commented on your post` });
      }
      return NextResponse.json({ comment }, { status: 201 });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const postId = path[0];
  if (!postId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const post = await getPostById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== authUser.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await deletePost(postId);
    return NextResponse.json({ message: "Deleted" });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
