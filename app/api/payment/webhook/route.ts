import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUser } from "@/lib/queries";
import { pg } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return new NextResponse(null, { status: 200 });

    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const hash = crypto.createHmac("sha512", secretKey).update(body).digest("hex");

    if (hash !== signature) {
      console.warn("[webhook] Invalid Paystack signature");
      return new NextResponse(null, { status: 400 });
    }

    const event = JSON.parse(body);
    if (event.event === "charge.success") {
      const { metadata, reference, amount } = event.data;
      const { userId, planId } = metadata || {};
      if (!userId || !planId) return new NextResponse(null, { status: 200 });

      const db = pg();
      if (db) {
        await db.query(
          `INSERT INTO payments (id, user_id, plan_id, reference, amount, status, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'success', NOW())
           ON CONFLICT (reference) DO NOTHING`,
          [userId, planId, reference, amount]
        );
      }

      const updates: Record<string, any> = {};
      if (planId === "verified_badge") updates.isVerified = true;
      if (planId === "profile_boost") updates.isBoosted = true;
      if (planId === "premium_theme") updates.premiumTheme = true;
      if (Object.keys(updates).length > 0) await updateUser(userId, updates);
    }

    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error("[webhook]", e);
    return new NextResponse(null, { status: 200 });
  }
}
