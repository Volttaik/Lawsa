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

    const items = await query(
      `SELECT * FROM store_items ORDER BY is_free DESC, price ASC`
    );

    let userItems: any[] = [];
    if (authUser) {
      userItems = await query(
        `SELECT * FROM user_store_items WHERE user_id = $1`,
        [authUser.userId]
      );
    }

    const userItemMap = new Map(userItems.map((ui: any) => [ui.item_id, ui]));

    const enriched = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      effectType: item.effect_type,
      effectData: item.effect_data || {},
      price: item.price,
      isFree: item.is_free,
      unlockCondition: item.unlock_condition,
      unlockThreshold: item.unlock_threshold,
      previewColor: item.preview_color,
      icon: item.icon,
      owned: userItemMap.has(item.id),
      equipped: userItemMap.get(item.id)?.equipped || false,
    }));

    return NextResponse.json({ items: enriched });
  } catch (e) {
    console.error("[store/get]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
