import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

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

    const { reference } = await request.json();
    if (!reference) return NextResponse.json({ error: "Reference required" }, { status: 400 });

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json();

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    const metadata = data.data.metadata;
    if (!metadata?.itemId) return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 });

    if (metadata.type === "store_item") {
      const existing = await queryOne(
        `SELECT id FROM user_store_items WHERE user_id = $1 AND item_id = $2`,
        [authUser.userId, metadata.itemId]
      );
      if (!existing) {
        await query(
          `INSERT INTO user_store_items (id, user_id, item_id, equipped) VALUES ($1, $2, $3, false)`,
          [randomUUID(), authUser.userId, metadata.itemId]
        );
      }
      return NextResponse.json({ success: true, type: "store_item", itemId: metadata.itemId });
    }

    return NextResponse.json({ error: "Unknown payment type" }, { status: 400 });
  } catch (e) {
    console.error("[store/verify-payment]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
