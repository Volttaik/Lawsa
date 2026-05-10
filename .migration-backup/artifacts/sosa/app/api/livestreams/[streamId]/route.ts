import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
  try {
    const { streamId } = await params;
    const pool = getPool();
    const { rows } = await pool.query(`SELECT * FROM live_streams WHERE id = $1`, [streamId]);
    const data = rows[0];
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      stream: {
        _id: data.id,
        hostId: data.host_id,
        hostName: data.host_name,
        hostUsername: data.host_username,
        hostImage: data.host_image || "",
        title: data.title || "Live",
        status: data.status,
        viewerCount: data.viewer_count || 0,
        createdAt: data.created_at,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
  try {
    const { streamId } = await params;
    const { action } = await request.json().catch(() => ({}));
    const pool = getPool();

    if (action === "join" || action === "leave") {
      const { rows } = await pool.query(`SELECT viewer_count FROM live_streams WHERE id = $1`, [streamId]);
      const current = rows[0]?.viewer_count || 0;
      const next = action === "join" ? current + 1 : Math.max(0, current - 1);
      await pool.query(`UPDATE live_streams SET viewer_count = $1 WHERE id = $2`, [next, streamId]);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ streamId: string }> }) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { streamId } = await params;
    const pool = getPool();
    await pool.query(
      `UPDATE live_streams SET status = 'ended', ended_at = NOW() WHERE id = $1 AND host_id = $2`,
      [streamId, authUser.userId]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
