import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT si.effect_type
       FROM user_store_items usi
       JOIN store_items si ON usi.item_id = si.id
       WHERE usi.user_id = $1 AND usi.equipped = true`,
      [params.userId]
    );

    const effects: string[] = rows.map((r: any) => r.effect_type);
    return NextResponse.json({
      badge:          effects.find(e => e.startsWith("badge_"))          ?? null,
      avatarRing:     effects.find(e => e.startsWith("avatar_ring_") || e.startsWith("avatar_aura_")) ?? null,
      usernameEffect: effects.find(e => e.startsWith("username_"))       ?? null,
      postBorder:     effects.find(e => e.startsWith("post_border_") || e.startsWith("post_glow_")) ?? null,
    });
  } catch (e) {
    console.error("[users/cosmetics]", e);
    return NextResponse.json({ badge: null, avatarRing: null, usernameEffect: null, postBorder: null });
  }
}
