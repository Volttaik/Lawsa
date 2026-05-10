import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const BADGES = [
  {
    effectType: "badge_sovereign",
    name: "Sovereign's Herald",
    description: "The rarest mark on LAWSA — a hand-crafted purple-and-gold heraldic crest. Displays beside your username everywhere you appear.",
    price: 200000,
    previewColor: "#a855f7",
  },
];

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  const expected = process.env.ADMIN_BACKFILL_KEY || "sossa-admin";
  if (key !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pool = getPool();
  const report = { inserted: 0, skipped: 0, errors: 0, deleted: 0 };

  try {
    const del = await pool.query(
      `DELETE FROM store_items WHERE effect_type != 'badge_sovereign'`
    );
    report.deleted = del.rowCount ?? 0;
  } catch (e: any) {
    console.error("[seed-store] Delete failed:", e.message);
  }

  for (const badge of BADGES) {
    try {
      const existing = await pool.query(
        `SELECT id FROM store_items WHERE effect_type = $1`,
        [badge.effectType]
      );
      if (existing.rows.length > 0) {
        report.skipped++;
        continue;
      }
      await pool.query(
        `INSERT INTO store_items (id, name, description, category, effect_type, effect_data, price, is_free, unlock_condition, unlock_threshold, preview_color, icon)
         VALUES ($1, $2, $3, 'badge', $4, '{}', $5, false, 'always', 0, $6, 'badge')`,
        [randomUUID(), badge.name, badge.description, badge.effectType, badge.price, badge.previewColor]
      );
      report.inserted++;
    } catch (e: any) {
      console.error(`[seed-store] Failed to insert ${badge.effectType}:`, e.message);
      report.errors++;
    }
  }

  return NextResponse.json({ ok: true, report });
}
