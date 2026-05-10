import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/queries";
import { getPool } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

async function dbQuery(sql: string, params: any[] = []) {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows;
}

async function dbQueryOne(sql: string, params: any[] = []) {
  const rows = await dbQuery(sql, params);
  return rows[0] || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const segment = path[0];

  if (!segment || segment === "") {
    try {
      const authUser = await getUserFromRequest(request);
      const items = await dbQuery(`SELECT * FROM store_items ORDER BY is_free DESC, price ASC`);
      let userItems: any[] = [];
      if (authUser) {
        userItems = await dbQuery(`SELECT * FROM user_store_items WHERE user_id = $1`, [authUser.userId]);
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

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const action = path[0];

  if (action === "equip") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { itemId, equipped } = await request.json();
      if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });
      const userItem = await dbQueryOne(`SELECT * FROM user_store_items WHERE user_id = $1 AND item_id = $2`, [authUser.userId, itemId]);
      if (!userItem) return NextResponse.json({ error: "Item not owned" }, { status: 403 });
      await dbQuery(`UPDATE user_store_items SET equipped = $1 WHERE user_id = $2 AND item_id = $3`, [!!equipped, authUser.userId, itemId]);
      return NextResponse.json({ success: true, equipped: !!equipped });
    } catch (e) {
      console.error("[store/equip]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "purchase") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { itemId } = await request.json();
      if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });
      const item = await dbQueryOne(`SELECT * FROM store_items WHERE id = $1`, [itemId]);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      const user = await getUserById(authUser.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const existing = await dbQueryOne(`SELECT id FROM user_store_items WHERE user_id = $1 AND item_id = $2`, [authUser.userId, itemId]);
      if (existing) return NextResponse.json({ error: "Already owned" }, { status: 400 });
      if (item.is_free) {
        await dbQuery(`INSERT INTO user_store_items (id, user_id, item_id, equipped) VALUES ($1, $2, $3, false)`, [randomUUID(), authUser.userId, itemId]);
        return NextResponse.json({ success: true, free: true });
      }
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
      const proto = request.headers.get("x-forwarded-proto") || "https";
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:5000";
      const callbackUrl = `${proto}://${host}/dashboard/customize?payment=success&item=${itemId}`;
      const metadata = { userId: authUser.userId, itemId, type: "store_item", itemName: item.name };
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: item.price, currency: "NGN", metadata, callback_url: callbackUrl, channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"] }),
      });
      const data = await res.json();
      if (!data.status) return NextResponse.json({ error: data.message || "Payment init failed" }, { status: 500 });
      return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
    } catch (e) {
      console.error("[store/purchase]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "verify-payment") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { reference } = await request.json();
      if (!reference) return NextResponse.json({ error: "Reference required" }, { status: 400 });
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
      const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, { headers: { Authorization: `Bearer ${secretKey}` } });
      const data = await res.json();
      if (!data.status || data.data?.status !== "success") return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
      const metadata = data.data.metadata;
      if (!metadata?.itemId) return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 });
      if (metadata.type === "store_item") {
        const existing = await dbQueryOne(`SELECT id FROM user_store_items WHERE user_id = $1 AND item_id = $2`, [authUser.userId, metadata.itemId]);
        if (!existing) {
          await dbQuery(`INSERT INTO user_store_items (id, user_id, item_id, equipped) VALUES ($1, $2, $3, false)`, [randomUUID(), authUser.userId, metadata.itemId]);
        }
        return NextResponse.json({ success: true, type: "store_item", itemId: metadata.itemId });
      }
      return NextResponse.json({ error: "Unknown payment type" }, { status: 400 });
    } catch (e) {
      console.error("[store/verify-payment]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
