import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

async function query(sql: string, params: any[] = []) {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows;
}

async function queryOne(sql: string, params: any[] = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { itemId, equipped } = await request.json();
    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    const userItem = await queryOne(
      `SELECT * FROM user_store_items WHERE user_id = $1 AND item_id = $2`,
      [authUser.userId, itemId]
    );
    if (!userItem) return NextResponse.json({ error: "Item not owned" }, { status: 403 });

    await query(
      `UPDATE user_store_items SET equipped = $1 WHERE user_id = $2 AND item_id = $3`,
      [!!equipped, authUser.userId, itemId]
    );

    return NextResponse.json({ success: true, equipped: !!equipped });
  } catch (e) {
    console.error("[store/equip]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
