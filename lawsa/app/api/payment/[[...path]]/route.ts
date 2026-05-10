import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, updateUser, savePayment } from "@/lib/queries";
import { PLANS, PlanId } from "@/lib/payment-plans";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const action = path[0];

  if (action === "initialize") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { planId, postId } = await request.json();
      if (!planId || !PLANS[planId as PlanId])
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      const plan = PLANS[planId as PlanId];
      const user = await getUserById(authUser.userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
      const metadata = { userId: authUser.userId, planId, postId: postId || null, userName: authUser.name, userUsername: authUser.username };
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`}/dashboard/premium?verified=1`;
      const channels = ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"];
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: plan.amount, currency: "NGN", metadata, callback_url: callbackUrl, channels }),
      });
      const data = await res.json();
      if (!data.status) return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 500 });
      return NextResponse.json({ authorization_url: data.data.authorization_url, access_code: data.data.access_code, reference: data.data.reference, plan: { id: planId, ...plan } });
    } catch (e) {
      console.error("[payment/initialize]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "verify") {
    try {
      const authUser = await getUserFromRequest(request);
      if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      const { reference } = await request.json();
      if (!reference) return NextResponse.json({ error: "Reference required" }, { status: 400 });
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
      const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, { headers: { Authorization: `Bearer ${secretKey}` } });
      const data = await res.json();
      if (!data.status || data.data.status !== "success")
        return NextResponse.json({ success: false, error: "Payment not successful" });
      const { userId, planId } = data.data.metadata;
      if (userId !== authUser.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      await savePayment({ userId, planId, reference, amount: data.data.amount, status: "success" });
      const updates: Record<string, any> = {};
      if (planId === "verified_badge") updates.isVerified = true;
      if (planId === "profile_boost") updates.isBoosted = true;
      if (planId === "premium_theme") updates.premiumTheme = true;
      if (Object.keys(updates).length > 0) await updateUser(userId, updates);
      return NextResponse.json({ success: true, planId, message: "Payment verified and feature activated" });
    } catch (e) {
      console.error("[payment/verify]", e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  if (action === "webhook") {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!secretKey) return new NextResponse(null, { status: 200 });
      const body = await request.text();
      const signature = request.headers.get("x-paystack-signature");
      const hash = crypto.createHmac("sha512", secretKey).update(body).digest("hex");
      if (hash !== signature) return new NextResponse(null, { status: 400 });
      const event = JSON.parse(body);
      if (event.event === "charge.success") {
        const { metadata, reference, amount } = event.data;
        const { userId, planId } = metadata || {};
        if (!userId || !planId) return new NextResponse(null, { status: 200 });
        await savePayment({ userId, planId, reference, amount, status: "success" });
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

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
