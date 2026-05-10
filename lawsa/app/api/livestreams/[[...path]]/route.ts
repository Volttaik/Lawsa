import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const [seg0, seg1] = path;

  // GET /api/livestreams
  if (!seg0) {
    try {
      const pool = getPool();
      const { rows: data } = await pool.query(`SELECT * FROM live_streams WHERE status = 'live' ORDER BY created_at DESC LIMIT 50`);
      const streams = data.map((r: any) => ({ _id: r.id, hostId: r.host_id, hostName: r.host_name, hostUsername: r.host_username, hostImage: r.host_image || "", title: r.title || "Live", viewerCount: r.viewer_count || 0, createdAt: r.created_at }));
      return NextResponse.json({ streams });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  const streamId = seg0;

  // GET /api/livestreams/[streamId]/chat
  if (seg1 === "chat") {
    try {
      const pool = getPool();
      const { rows } = await pool.query(`SELECT * FROM world_chat_messages WHERE clan_id = $1 ORDER BY created_at ASC LIMIT 100`, [`live_${streamId}`]);
      return NextResponse.json({ messages: rows });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // GET /api/livestreams/[streamId]
  if (!seg1) {
    try {
      const pool = getPool();
      const { rows } = await pool.query(`SELECT * FROM live_streams WHERE id = $1`, [streamId]);
      const data = rows[0];
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ stream: { _id: data.id, hostId: data.host_id, hostName: data.host_name, hostUsername: data.host_username, hostImage: data.host_image || "", title: data.title || "Live", status: data.status, viewerCount: data.viewer_count || 0, createdAt: data.created_at } });
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

  // POST /api/livestreams (create stream)
  if (!seg0) {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { title } = await request.json().catch(() => ({}));
      const pool = getPool();
      const id = randomUUID();
      await pool.query(`UPDATE live_streams SET status = 'ended', ended_at = NOW() WHERE host_id = $1 AND status = 'live'`, [authUser.userId]);
      const { rows: userRows } = await pool.query(`SELECT profile_image FROM users WHERE id = $1`, [authUser.userId]);
      const profileImage = userRows[0]?.profile_image || "";
      await pool.query(`INSERT INTO live_streams (id, host_id, host_name, host_username, host_image, title, status, viewer_count) VALUES ($1,$2,$3,$4,$5,$6,'live',0)`, [id, authUser.userId, authUser.name, authUser.username, profileImage, title?.trim() || "Live"]);
      return NextResponse.json({ stream: { _id: id, hostId: authUser.userId, hostName: authUser.name, hostUsername: authUser.username, hostImage: profileImage, title: title?.trim() || "Live", viewerCount: 0 } });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  // POST /api/livestreams/[streamId]/chat
  if (seg1 === "chat") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { content } = await request.json();
      if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
      const pool = getPool();
      const { rows: userRows } = await pool.query(`SELECT profile_image, username FROM users WHERE id = $1`, [authUser.userId]);
      const user = userRows[0];
      const id = randomUUID();
      await pool.query(`INSERT INTO world_chat_messages (id, clan_id, sender_id, sender_name, sender_username, sender_image, content) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id, `live_${seg0}`, authUser.userId, authUser.name, user?.username || "", user?.profile_image || "", content.trim()]);
      return NextResponse.json({ message: { _id: id, senderId: authUser.userId, senderName: authUser.name, senderUsername: user?.username || "", senderImage: user?.profile_image || "", content: content.trim(), createdAt: new Date().toISOString() } }, { status: 201 });
    } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const streamId = path[0];
  if (!streamId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { action } = await request.json().catch(() => ({}));
    const pool = getPool();
    if (action === "join" || action === "leave") {
      const { rows } = await pool.query(`SELECT viewer_count FROM live_streams WHERE id = $1`, [streamId]);
      const current = rows[0]?.viewer_count || 0;
      const next = action === "join" ? current + 1 : Math.max(0, current - 1);
      await pool.query(`UPDATE live_streams SET viewer_count = $1 WHERE id = $2`, [next, streamId]);
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const streamId = path[0];
  if (!streamId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const pool = getPool();
    await pool.query(`UPDATE live_streams SET status = 'ended', ended_at = NOW() WHERE id = $1 AND host_id = $2`, [streamId, authUser.userId]);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
