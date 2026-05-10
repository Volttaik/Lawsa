import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = getPool();
    const { rows: data } = await pool.query(
      `SELECT * FROM live_streams WHERE status = 'live' ORDER BY created_at DESC LIMIT 50`
    );

    const streams = data.map((r: any) => ({
      _id: r.id,
      hostId: r.host_id,
      hostName: r.host_name,
      hostUsername: r.host_username,
      hostImage: r.host_image || "",
      title: r.title || "Live",
      viewerCount: r.viewer_count || 0,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ streams });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { title } = await request.json().catch(() => ({}));
    const pool = getPool();
    const id = randomUUID();

    await pool.query(
      `UPDATE live_streams SET status = 'ended', ended_at = NOW() WHERE host_id = $1 AND status = 'live'`,
      [authUser.userId]
    );
    const { rows: userRows } = await pool.query(`SELECT profile_image FROM users WHERE id = $1`, [authUser.userId]);
    const profileImage = userRows[0]?.profile_image || "";

    await pool.query(
      `INSERT INTO live_streams (id, host_id, host_name, host_username, host_image, title, status, viewer_count)
       VALUES ($1,$2,$3,$4,$5,$6,'live',0)`,
      [id, authUser.userId, authUser.name, authUser.username, profileImage, title?.trim() || "Live"]
    );

    return NextResponse.json({
      stream: {
        _id: id,
        hostId: authUser.userId,
        hostName: authUser.name,
        hostUsername: authUser.username,
        hostImage: profileImage,
        title: title?.trim() || "Live",
        viewerCount: 0,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
