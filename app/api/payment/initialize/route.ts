import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PLANS = {
  verified_badge: { name: "Verified Badge", amount: 250000, description: "Get a blue verified checkmark on your profile" },
  profile_boost: { name: "Profile Boost (30 days)", amount: 150000, description: "Be featured in suggestions for 30 days" },
  premium_theme: { name: "Premium Theme", amount: 100000, description: "Unlock gold/purple profile border & theme" },
  post_boost: { name: "Post Boost", amount: 50000, description: "Boost a post for maximum visibility" },
};

export type PlanId = keyof typeof PLANS;

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { planId, postId } = await request.json();
    if (!planId || !PLANS[planId as PlanId]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const plan = PLANS[planId as PlanId];
    const user = await getUserById(authUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });

    const metadata = { userId: authUser.userId, planId, postId: postId || null, userName: authUser.name, userUsername: authUser.username };
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`}/dashboard/premium?verified=1`;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount: plan.amount, currency: "NGN", metadata, callback_url: callbackUrl, channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"] }),
    });

    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 500 });

    return NextResponse.json({ authorization_url: data.data.authorization_url, access_code: data.data.access_code, reference: data.data.reference, plan: { id: planId, ...plan } });
  } catch (e) {
    console.error("[payment/initialize]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export { PLANS };
