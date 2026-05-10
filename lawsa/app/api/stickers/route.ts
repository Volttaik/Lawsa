import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

async function query(sql: string, params: any[] = []) {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);

    const packs = await query(`SELECT * FROM sticker_packs ORDER BY is_free DESC, price ASC`);
    const stickers = await query(`SELECT * FROM stickers ORDER BY created_at ASC`);

    let userPacks: string[] = [];
    if (authUser) {
      const rows = await query(
        `SELECT pack_id FROM user_sticker_packs WHERE user_id = $1`,
        [authUser.userId]
      );
      userPacks = rows.map((r: any) => r.pack_id);
    }

    const enrichedPacks = packs.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      emoji: p.emoji,
      isFree: p.is_free,
      price: p.price,
      owned: p.is_free || userPacks.includes(p.id),
      stickers: stickers
        .filter((s: any) => s.pack_id === p.id)
        .map((s: any) => ({
          id: s.id,
          packId: s.pack_id,
          name: s.name,
          value: s.value,
          isAnimated: s.is_animated,
        })),
    }));

    return NextResponse.json({ packs: enrichedPacks });
  } catch (e) {
    console.error("[stickers/get]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
