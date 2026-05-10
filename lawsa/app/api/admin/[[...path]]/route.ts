import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { mapPost, mapUser, socialEventExists, createSocialEvent } from "@/lib/queries";
import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "onyeaghorlouis@gmail.com";

async function requireAdmin(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth || auth.email.toLowerCase() !== ADMIN_EMAIL) return null;
  return auth;
}

function requireAdminKey(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_BACKFILL_KEY || "sossa-admin";
  return key === expected;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await params;
  const [seg0, seg1, seg2] = segments;

  // GET /api/admin/badge/sovereign
  if (seg0 === "badge" && seg1 === "sovereign") {
    try {
      const imgPath = path.join(process.cwd(), "public", "badge-sovereign.png");
      const imgBuffer = await readFile(imgPath);
      return new NextResponse(imgBuffer, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // GET /api/admin/world/posts
  if (seg0 === "world" && seg1 === "posts" && !seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;
    const pool = getPool();
    let rows;
    if (search) {
      const q = `%${search}%`;
      const result = await pool.query(
        `SELECT p.*, u.is_verified AS author_is_verified, u.email_verified AS author_email_verified, u.email AS author_email FROM posts p LEFT JOIN users u ON u.id = p.author_id WHERE p.content ILIKE $1 OR p.author_name ILIKE $1 OR p.author_username ILIKE $1 ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
        [q, limit, offset]
      );
      rows = result.rows;
    } else {
      const result = await pool.query(
        `SELECT p.*, u.is_verified AS author_is_verified, u.email_verified AS author_email_verified, u.email AS author_email FROM posts p LEFT JOIN users u ON u.id = p.author_id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      rows = result.rows;
    }
    const countResult = await pool.query(
      search ? `SELECT COUNT(*) FROM posts WHERE content ILIKE $1 OR author_name ILIKE $1 OR author_username ILIKE $1` : `SELECT COUNT(*) FROM posts`,
      search ? [`%${search}%`] : []
    );
    return NextResponse.json({ posts: rows.map(mapPost), total: parseInt(countResult.rows[0].count), page, limit });
  }

  // GET /api/admin/world/users
  if (seg0 === "world" && seg1 === "users" && !seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;
    const pool = getPool();
    let rows;
    if (search) {
      const q = `%${search}%`;
      const result = await pool.query(
        `SELECT *, (SELECT COUNT(*) FROM posts WHERE author_id = users.id)::int AS posts_count, array_length(followers::jsonb::text[], 1) AS followers_count, array_length(following::jsonb::text[], 1) AS following_count FROM users WHERE name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [q, limit, offset]
      );
      rows = result.rows;
    } else {
      const result = await pool.query(
        `SELECT *, (SELECT COUNT(*) FROM posts WHERE author_id = users.id)::int AS posts_count FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      rows = result.rows;
    }
    const countResult = await pool.query(
      search ? `SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1` : `SELECT COUNT(*) FROM users`,
      search ? [`%${search}%`] : []
    );
    return NextResponse.json({ users: rows.map(mapUser), total: parseInt(countResult.rows[0].count), page, limit });
  }

  // GET /api/admin/world/users/[userId]
  if (seg0 === "world" && seg1 === "users" && seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const pool = getPool();
    const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [seg2]);
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const postsResult = await pool.query(`SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 50`, [seg2]);
    return NextResponse.json({ user: mapUser(rows[0]), posts: postsResult.rows });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await params;
  const [seg0] = segments;

  // POST /api/admin/backfill-events
  if (seg0 === "backfill-events") {
    if (!requireAdminKey(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const pool = getPool();
    const report = { follows: 0, likes: 0, skipped: 0, errors: 0 };
    try {
      const { rows: users } = await pool.query("SELECT id, name, username, profile_image, followers, following FROM users");
      const userMap: Record<string, any> = {};
      for (const u of users) userMap[u.id] = u;
      for (const user of users) {
        const following: string[] = user.following || [];
        for (const targetId of following) {
          try {
            const exists = await socialEventExists("follow", user.id, targetId);
            if (exists) { report.skipped++; continue; }
            const target = userMap[targetId];
            await createSocialEvent({ type: "follow", actorId: user.id, actorName: user.name || "", actorUsername: user.username || "", actorImage: user.profile_image || "", recipientId: targetId, targetId, targetType: "user", metadata: { targetName: target?.name || "", targetUsername: target?.username || "" } });
            report.follows++;
          } catch { report.errors++; }
        }
      }
      const { rows: posts } = await pool.query("SELECT id, author_id, content, likes FROM posts");
      for (const post of posts) {
        const likes: string[] = post.likes || [];
        for (const actorId of likes) {
          try {
            const exists = await socialEventExists("like", actorId, post.id);
            if (exists) { report.skipped++; continue; }
            const actor = userMap[actorId];
            await createSocialEvent({ type: "like", actorId, actorName: actor?.name || "", actorUsername: actor?.username || "", actorImage: actor?.profile_image || "", recipientId: post.author_id || "", targetId: post.id, targetType: "post", metadata: { postContent: (post.content || "").slice(0, 120) } });
            report.likes++;
          } catch { report.errors++; }
        }
      }
      return NextResponse.json({ ok: true, report });
    } catch (e: any) {
      return NextResponse.json({ error: e.message, report }, { status: 500 });
    }
  }

  // POST /api/admin/seed-badge-svg
  if (seg0 === "seed-badge-svg") {
    if (!requireAdminKey(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    try {
      const pool = getPool();
      const svgPath = path.join(process.cwd(), "public", "badge-herald.svg");
      const svgBuffer = await readFile(svgPath);
      const base64 = svgBuffer.toString("base64");
      await pool.query(`DELETE FROM media_files WHERE filename = 'badge-herald.svg'`);
      const id = randomUUID();
      await pool.query(`INSERT INTO media_files (id, filename, mime_type, data, user_id) VALUES ($1, $2, $3, $4, $5)`, [id, "badge-herald.svg", "image/svg+xml", base64, "system"]);
      return NextResponse.json({ ok: true, id, sizeKB: Math.round(svgBuffer.length / 1024) });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // POST /api/admin/seed-store
  if (seg0 === "seed-store") {
    if (!requireAdminKey(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const BADGES = [
      { effectType: "badge_sovereign", name: "Sovereign's Herald", description: "The rarest mark on LAWSA — a hand-crafted animated heraldic crest. Displays beside your username everywhere you appear.", price: 1000000, isFree: false, unlockCondition: "always", unlockThreshold: 0, previewColor: "#a855f7" },
      { effectType: "badge_lion", name: "Lion of LAWSA", description: "The golden lion — a mark of power and prestige on LAWSA.", price: 100000, isFree: false, unlockCondition: "always", unlockThreshold: 0, previewColor: "#fbbf24" },
      { effectType: "badge_fist", name: "Iron Fist", description: "Earned by loyalty. Awarded to those who reach 10 followers.", price: 0, isFree: true, unlockCondition: "followers", unlockThreshold: 10, previewColor: "#b45309" },
    ];
    const pool = getPool();
    const report = { inserted: 0, skipped: 0, errors: 0, updated: 0 };
    for (const badge of BADGES) {
      try {
        const existing = await pool.query(`SELECT id FROM store_items WHERE effect_type = $1`, [badge.effectType]);
        if (existing.rows.length > 0) {
          await pool.query(`UPDATE store_items SET price = $1, is_free = $2, unlock_condition = $3, unlock_threshold = $4 WHERE effect_type = $5`, [badge.price, badge.isFree, badge.unlockCondition, badge.unlockThreshold, badge.effectType]);
          report.updated++;
          continue;
        }
        await pool.query(`INSERT INTO store_items (id, name, description, category, effect_type, effect_data, price, is_free, unlock_condition, unlock_threshold, preview_color, icon) VALUES ($1, $2, $3, 'badge', $4, '{}', $5, $6, $7, $8, $9, 'badge')`, [randomUUID(), badge.name, badge.description, badge.effectType, badge.price, badge.isFree, badge.unlockCondition, badge.unlockThreshold, badge.previewColor]);
        report.inserted++;
      } catch (e: any) { console.error(`[seed-store] Failed to insert ${badge.effectType}:`, e.message); report.errors++; }
    }
    return NextResponse.json({ ok: true, report });
  }

  // POST /api/admin/setup-tables
  if (seg0 === "setup-tables") {
    if (!requireAdminKey(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const pool = getPool();
    const results: string[] = [];
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS upload_chunks (id TEXT PRIMARY KEY, upload_id TEXT NOT NULL, chunk_index INTEGER NOT NULL, total_chunks INTEGER NOT NULL, filename TEXT NOT NULL, mime_type TEXT NOT NULL, subfolder TEXT NOT NULL DEFAULT '', data BYTEA NOT NULL, user_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      results.push("upload_chunks table: OK");
      await pool.query(`CREATE INDEX IF NOT EXISTS upload_chunks_upload_id_idx ON upload_chunks (upload_id)`);
      results.push("upload_chunks index: OK");
      await pool.query(`CREATE TABLE IF NOT EXISTS store_items (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT 'badge', effect_type TEXT NOT NULL UNIQUE, effect_data JSONB NOT NULL DEFAULT '{}', price INTEGER NOT NULL DEFAULT 0, is_free BOOLEAN NOT NULL DEFAULT false, unlock_condition TEXT NOT NULL DEFAULT 'always', unlock_threshold INTEGER NOT NULL DEFAULT 0, preview_color TEXT NOT NULL DEFAULT '#ffffff', icon TEXT NOT NULL DEFAULT 'badge', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      results.push("store_items table: OK");
      await pool.query(`CREATE TABLE IF NOT EXISTS user_store_items (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, item_id TEXT NOT NULL REFERENCES store_items(id), equipped BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (user_id, item_id))`);
      results.push("user_store_items table: OK");
      await pool.query(`CREATE TABLE IF NOT EXISTS media_files (id TEXT PRIMARY KEY, filename TEXT NOT NULL, mime_type TEXT NOT NULL, data TEXT NOT NULL, user_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      results.push("media_files table: OK");
      return NextResponse.json({ ok: true, results });
    } catch (e: any) {
      return NextResponse.json({ error: e.message, results }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await params;
  const [seg0, seg1, seg2] = segments;

  // PUT /api/admin/world/posts/[postId]
  if (seg0 === "world" && seg1 === "posts" && seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const pool = getPool();
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (body.content !== undefined) { sets.push(`content = $${i++}`); vals.push(body.content); }
    if (body.category !== undefined) { sets.push(`category = $${i++}`); vals.push(body.category); }
    if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    sets.push(`updated_at = NOW()`);
    vals.push(seg2);
    const { rows } = await pool.query(`UPDATE posts SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
    return NextResponse.json({ post: mapPost(rows[0]) });
  }

  // PUT /api/admin/world/users/[userId]
  if (seg0 === "world" && seg1 === "users" && seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const pool = getPool();
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (body.name !== undefined)          { sets.push(`name = $${i++}`);           vals.push(body.name); }
    if (body.username !== undefined)      { sets.push(`username = $${i++}`);       vals.push(body.username); }
    if (body.email !== undefined)         { sets.push(`email = $${i++}`);          vals.push(body.email); }
    if (body.bio !== undefined)           { sets.push(`bio = $${i++}`);            vals.push(body.bio); }
    if (body.headline !== undefined)      { sets.push(`headline = $${i++}`);       vals.push(body.headline); }
    if (body.website !== undefined)       { sets.push(`website = $${i++}`);        vals.push(body.website); }
    if (body.location !== undefined)      { sets.push(`location = $${i++}`);       vals.push(body.location); }
    if (body.phone !== undefined)         { sets.push(`phone = $${i++}`);          vals.push(body.phone); }
    if (body.isVerified !== undefined)    { sets.push(`is_verified = $${i++}`);    vals.push(body.isVerified); }
    if (body.isBoosted !== undefined)     { sets.push(`is_boosted = $${i++}`);     vals.push(body.isBoosted); }
    if (body.premiumTheme !== undefined)  { sets.push(`premium_theme = $${i++}`);  vals.push(body.premiumTheme); }
    if (body.emailVerified !== undefined) { sets.push(`email_verified = $${i++}`); vals.push(body.emailVerified); }
    if (body.profileImage !== undefined)  { sets.push(`profile_image = $${i++}`);  vals.push(body.profileImage); }
    if (body.bannerImage !== undefined)   { sets.push(`banner_image = $${i++}`);   vals.push(body.bannerImage); }
    if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    sets.push(`updated_at = NOW()`);
    vals.push(seg2);
    const { rows } = await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals);
    return NextResponse.json({ user: mapUser(rows[0]) });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments = [] } = await params;
  const [seg0, seg1, seg2] = segments;

  // DELETE /api/admin/world/posts/[postId]
  if (seg0 === "world" && seg1 === "posts" && seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const pool = getPool();
    await pool.query(`DELETE FROM comments WHERE post_id = $1`, [seg2]);
    await pool.query(`DELETE FROM notifications WHERE post_id = $1`, [seg2]);
    await pool.query(`DELETE FROM posts WHERE id = $1`, [seg2]);
    return NextResponse.json({ success: true });
  }

  // DELETE /api/admin/world/users/[userId]
  if (seg0 === "world" && seg1 === "users" && seg2) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const pool = getPool();
    await pool.query(`DELETE FROM posts WHERE author_id = $1`, [seg2]);
    await pool.query(`DELETE FROM comments WHERE author_id = $1`, [seg2]);
    await pool.query(`DELETE FROM notifications WHERE recipient_id = $1 OR sender_id = $1`, [seg2]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [seg2]);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
