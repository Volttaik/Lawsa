import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { sessionId, toUserId, type, payload } = await request.json();
    if (!sessionId || !toUserId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO call_signals (id, session_id, from_user_id, to_user_id, type, payload) VALUES ($1,$2,$3,$4,$5,$6)`,
      [randomUUID(), sessionId, authUser.userId, toUserId, type, JSON.stringify(payload || {})]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const since = searchParams.get("since") || new Date(0).toISOString();
    const types = searchParams.get("types");

    const pool = getPool();
    let sql = `SELECT * FROM call_signals WHERE to_user_id = $1 AND created_at > $2`;
    const params: any[] = [authUser.userId, since];
    if (sessionId) { sql += ` AND session_id = $${params.length + 1}`; params.push(sessionId); }
    if (types) {
      const list = types.split(",");
      sql += ` AND type = ANY($${params.length + 1}::text[])`; params.push(list);
    }
    sql += ` ORDER BY created_at ASC LIMIT 50`;
    const { rows } = await pool.query(sql, params);
    return NextResponse.json({ signals: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
