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

    const { packId } = await request.json();
    if (!packId) return NextResponse.json({ error: "Pack ID required" }, { status: 400 });

    const pack = await queryOne(`SELECT * FROM sticker_packs WHERE id = $1`, [packId]);
    if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

    const user = await getUserById(authUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await queryOne(
      `SELECT user_id FROM user_sticker_packs WHERE user_id = $1 AND pack_id = $2`,
      [authUser.userId, packId]
    );
    if (existing) return NextResponse.json({ error: "Already owned" }, { status: 400 });

    if (pack.is_free) {
      await query(
        `INSERT INTO user_sticker_packs (user_id, pack_id) VALUES ($1, $2)`,
        [authUser.userId, packId]
      );
      return NextResponse.json({ success: true, free: true });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:5000";
    const callbackUrl = `${proto}://${host}/dashboard/messages?payment=success&pack=${packId}`;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: pack.price,
        currency: "NGN",
        metadata: { userId: authUser.userId, packId, type: "sticker_pack", packName: pack.name },
        callback_url: callbackUrl,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      }),
    });

    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Payment init failed" }, { status: 500 });

    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch (e) {
    console.error("[stickers/purchase]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
