import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM world_chat_messages WHERE clan_id = $1 ORDER BY created_at ASC LIMIT 100`,
      [`live_${streamId}`]
    );
    return NextResponse.json({ messages: rows });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { streamId } = await params;
    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const pool = getPool();
    const { rows: userRows } = await pool.query(`SELECT profile_image, username FROM users WHERE id = $1`, [authUser.userId]);
    const user = userRows[0];
    const id = randomUUID();
    await pool.query(
      `INSERT INTO world_chat_messages (id, clan_id, sender_id, sender_name, sender_username, sender_image, content)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, `live_${streamId}`, authUser.userId, authUser.name, user?.username || "", user?.profile_image || "", content.trim()]
    );

    return NextResponse.json({
      message: {
        _id: id,
        senderId: authUser.userId,
        senderName: authUser.name,
        senderUsername: user?.username || "",
        senderImage: user?.profile_image || "",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
