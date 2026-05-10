import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/queries";
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

    const { itemId } = await request.json();
    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    const item = await queryOne(`SELECT * FROM store_items WHERE id = $1`, [itemId]);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const user = await getUserById(authUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await queryOne(
      `SELECT id FROM user_store_items WHERE user_id = $1 AND item_id = $2`,
      [authUser.userId, itemId]
    );
    if (existing) return NextResponse.json({ error: "Already owned" }, { status: 400 });

    if (item.is_free) {
      const { randomUUID } = await import("crypto");
      await query(
        `INSERT INTO user_store_items (id, user_id, item_id, equipped) VALUES ($1, $2, $3, false)`,
        [randomUUID(), authUser.userId, itemId]
      );
      return NextResponse.json({ success: true, free: true });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:5000";
    const callbackUrl = `${proto}://${host}/dashboard/customize?payment=success&item=${itemId}`;

    const metadata = {
      userId: authUser.userId,
      itemId,
      type: "store_item",
      itemName: item.name,
    };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: item.price,
        currency: "NGN",
        metadata,
        callback_url: callbackUrl,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      }),
    });

    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Payment init failed" }, { status: 500 });

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (e) {
    console.error("[store/purchase]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
