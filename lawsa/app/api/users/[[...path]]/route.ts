import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  findUsers, getUserById, updateUser, updateUserLastOnline,
  countPostsByAuthor, countSocialEvents, toggleFollow,
  getUserRecommendations, createNotification,
  getFollowerEvents, getFollowingEvents,
} from "@/lib/queries";
import { getPool } from "@/lib/db";
import { cache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // GET /api/users (list)
  if (!seg0) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search") || "";
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const users = await findUsers(search, page, limit, authUser.userId);
      const safe = users.map(({ password: _pw, ...u }: any) => u);
      return NextResponse.json({ users: safe });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
  }

  // GET /api/users/search
  if (seg0 === "search") {
    try {
      const authUser = await getUserFromRequest(request);
      const { searchParams } = new URL(request.url);
      const q = searchParams.get("q") || "";
      const limit = parseInt(searchParams.get("limit") || "10");
      const users = await findUsers(q, 1, limit, authUser?.userId || "");
      const safe = users.map(({ password: _pw, ...u }: any) => u);
      return NextResponse.json({ users: safe });
    } catch { return NextResponse.json({ users: [] }); }
  }

  // GET /api/users/suggestions
  if (seg0 === "suggestions") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ users: [] });
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "5");
      const cacheKey = `suggestions:${authUser.userId}:${limit}`;
      const cached = cache.get<any[]>(cacheKey);
      if (cached !== null) {
        const res = NextResponse.json({ users: cached });
        res.headers.set("Cache-Control", "private, max-age=60");
        return res;
      }
      const me = await getUserById(authUser.userId);
      const following: string[] = me?.following || [];
      const exclude = new Set([authUser.userId, ...following]);
      const users = await findUsers("", 1, limit + exclude.size + 5, authUser.userId);
      const suggestions = users.filter((u: any) => !exclude.has(u.id)).slice(0, limit).map(({ password: _pw, ...u }: any) => u);
      cache.set(cacheKey, suggestions, 60);
      const res = NextResponse.json({ users: suggestions });
      res.headers.set("Cache-Control", "private, max-age=60");
      return res;
    } catch { return NextResponse.json({ users: [] }); }
  }

  // GET /api/users/recommendations
  if (seg0 === "recommendations") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ users: [] }, { status: 401 });
      const me = await getUserById(authUser.userId);
      const following = me?.following || [];
      const users = await getUserRecommendations(authUser.userId, following, 5);
      const safe = users.map(({ password: _pw, ...u }: any) => u);
      return NextResponse.json({ users: safe });
    } catch { return NextResponse.json({ users: [] }, { status: 500 }); }
  }

  // At this point seg0 is a userId
  const userId = seg0;

  // GET /api/users/[userId]
  if (!seg1) {
    try {
      const [user, postsCount, followersCount, followingCount] = await Promise.all([
        getUserById(userId),
        countPostsByAuthor(userId),
        countSocialEvents("follow", "recipient_id", userId),
        countSocialEvents("follow", "actor_id", userId),
      ]);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const { password: _pw, ...safe } = user as any;
      safe.postsCount = postsCount;
      if (followersCount > 0) safe.followersCount = followersCount;
      if (followingCount > 0) safe.followingCount = followingCount;
      const res = NextResponse.json({ user: safe });
      res.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");
      return res;
    } catch { return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 }); }
  }

  // GET /api/users/[userId]/followers
  if (seg1 === "followers") {
    try {
      const events = await getFollowerEvents(userId);
      if (events.length > 0) {
        const enriched = await Promise.all(events.map(async (e) => {
          const user = await getUserById(e!.actorId);
          if (!user) return { _id: e!.actorId, id: e!.actorId, name: e!.actorName, username: e!.actorUsername, profileImage: e!.actorImage, followedAt: e!.createdAt, eventId: e!._id };
          const { password: _pw, ...safe } = user as any;
          return { ...safe, followedAt: e!.createdAt, eventId: e!._id };
        }));
        return NextResponse.json({ users: enriched.filter(Boolean) });
      }
      const user = await getUserById(userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const followerIds: string[] = user.followers || [];
      const followers = await Promise.all(followerIds.map((id) => getUserById(id)));
      const result = followers.filter(Boolean).map((u) => { const { password: _pw, ...safe } = u as any; return safe; });
      return NextResponse.json({ users: result });
    } catch (e) {
      console.error("[/api/users/[userId]/followers]", e);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  }

  // GET /api/users/[userId]/following
  if (seg1 === "following") {
    try {
      const events = await getFollowingEvents(userId);
      if (events.length > 0) {
        const enriched = await Promise.all(events.map(async (e) => {
          const user = await getUserById(e!.targetId);
          if (!user) return { _id: e!.targetId, id: e!.targetId, name: e!.metadata?.targetName || "", username: e!.metadata?.targetUsername || "", profileImage: "", followedAt: e!.createdAt, eventId: e!._id };
          const { password: _pw, ...safe } = user as any;
          return { ...safe, followedAt: e!.createdAt, eventId: e!._id };
        }));
        return NextResponse.json({ users: enriched.filter(Boolean) });
      }
      const user = await getUserById(userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const followingIds: string[] = user.following || [];
      const following = await Promise.all(followingIds.map((id) => getUserById(id)));
      const result = following.filter(Boolean).map((u) => { const { password: _pw, ...safe } = u as any; return safe; });
      return NextResponse.json({ users: result });
    } catch (e) {
      console.error("[/api/users/[userId]/following]", e);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
  }

  // GET /api/users/[userId]/cosmetics
  if (seg1 === "cosmetics") {
    try {
      const pool = getPool();
      const { rows } = await pool.query(
        `SELECT si.effect_type FROM user_store_items usi JOIN store_items si ON usi.item_id = si.id WHERE usi.user_id = $1 AND usi.equipped = true`,
        [userId]
      );
      const effects: string[] = rows.map((r: any) => r.effect_type);
      return NextResponse.json({
        badge: effects.find((e) => e.startsWith("badge_")) ?? null,
        avatarRing: effects.find((e) => e.startsWith("avatar_ring_") || e.startsWith("avatar_aura_")) ?? null,
        usernameEffect: effects.find((e) => e.startsWith("username_")) ?? null,
        postBorder: effects.find((e) => e.startsWith("post_border_") || e.startsWith("post_glow_")) ?? null,
      });
    } catch (e) {
      console.error("[users/cosmetics]", e);
      return NextResponse.json({ badge: null, avatarRing: null, usernameEffect: null, postBorder: null });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const userId = path[0];
  if (!userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (authUser.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const updates: any = {};
    if (body.name) updates.name = body.name;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.headline !== undefined) updates.headline = body.headline;
    if (body.website !== undefined) updates.website = body.website;
    if (body.location !== undefined) updates.location = body.location;
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.experience !== undefined) updates.experience = body.experience;
    if (body.education !== undefined) updates.education = body.education;
    if (body.profileImage) updates.profileImage = body.profileImage;
    if (body.bannerImage) updates.bannerImage = body.bannerImage;
    const updated = await updateUser(userId, updates);
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password: _pw, ...safe } = updated as any;
    return NextResponse.json({ user: safe });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Failed to update user" }, { status: 500 }); }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return PUT(request, { params });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // POST /api/users/heartbeat
  if (seg0 === "heartbeat") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ ok: false }, { status: 401 });
      await updateUserLastOnline(authUser.userId);
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ ok: false }, { status: 500 }); }
  }

  // POST /api/users/[userId]/follow
  if (seg1 === "follow") {
    const userId = seg0;
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      if (authUser.userId === userId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
      const result = await toggleFollow(authUser.userId, userId);
      if (!result) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (result.following) {
        const me = await getUserById(authUser.userId);
        await createNotification({ recipientId: userId, senderId: authUser.userId, senderName: authUser.name, senderImage: me?.profileImage || "", type: "follow", message: `${authUser.name} started following you` });
      }
      return NextResponse.json(result);
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
