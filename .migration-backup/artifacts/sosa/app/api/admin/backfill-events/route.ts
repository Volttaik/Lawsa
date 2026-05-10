import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { socialEventExists } from "@/lib/queries";
import { createSocialEvent } from "@/lib/queries";

export const dynamic = "force-dynamic";

// One-time backfill: populates social_events from existing followers/likes arrays.
// Call once after running supabase-migration.sql in Supabase SQL Editor.
// Protected by a simple secret header: X-Admin-Key must match ADMIN_BACKFILL_KEY env var (or "sossa-admin" if unset).
export async function POST(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_BACKFILL_KEY || "sossa-admin";
  if (key !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pool = getPool();
  const report = { follows: 0, likes: 0, skipped: 0, errors: 0 };

  try {
    const { rows: users } = await pool.query(
      "SELECT id, name, username, profile_image, followers, following FROM users"
    );

    const userMap: Record<string, any> = {};
    for (const u of users) userMap[u.id] = u;

    for (const user of users) {
      const following: string[] = user.following || [];
      for (const targetId of following) {
        try {
          const exists = await socialEventExists("follow", user.id, targetId);
          if (exists) { report.skipped++; continue; }
          const target = userMap[targetId];
          await createSocialEvent({
            type: "follow",
            actorId: user.id,
            actorName: user.name || "",
            actorUsername: user.username || "",
            actorImage: user.profile_image || "",
            recipientId: targetId,
            targetId,
            targetType: "user",
            metadata: { targetName: target?.name || "", targetUsername: target?.username || "" },
          });
          report.follows++;
        } catch { report.errors++; }
      }
    }

    const { rows: posts } = await pool.query(
      "SELECT id, author_id, content, likes FROM posts"
    );

    for (const post of posts) {
      const likes: string[] = post.likes || [];
      for (const actorId of likes) {
        try {
          const exists = await socialEventExists("like", actorId, post.id);
          if (exists) { report.skipped++; continue; }
          const actor = userMap[actorId];
          await createSocialEvent({
            type: "like",
            actorId,
            actorName: actor?.name || "",
            actorUsername: actor?.username || "",
            actorImage: actor?.profile_image || "",
            recipientId: post.author_id || "",
            targetId: post.id,
            targetType: "post",
            metadata: { postContent: (post.content || "").slice(0, 120) },
          });
          report.likes++;
        } catch { report.errors++; }
      }
    }

    return NextResponse.json({ ok: true, report });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, report }, { status: 500 });
  }
}
