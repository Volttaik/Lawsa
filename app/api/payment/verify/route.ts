import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { updateUser, getUserById } from "@/lib/queries";
import { pg } from "@/lib/db";

export const dynamic = "force-dynamic";

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

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment not successful" });
    }

    const { userId, planId } = data.data.metadata;
    if (userId !== authUser.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const db = pg();
    if (db) {
      await db.query(
        `INSERT INTO payments (id, user_id, plan_id, reference, amount, status, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'success', NOW())
         ON CONFLICT (reference) DO NOTHING`,
        [userId, planId, reference, data.data.amount]
      );
    }

    const updates: Record<string, any> = {};
    if (planId === "verified_badge") updates.isVerified = true;
    if (planId === "profile_boost") updates.isBoosted = true;
    if (planId === "premium_theme") updates.premiumTheme = true;

    if (Object.keys(updates).length > 0) {
      await updateUser(userId, updates);
    }

    return NextResponse.json({ success: true, planId, message: "Payment verified and feature activated" });
  } catch (e) {
    console.error("[payment/verify]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
