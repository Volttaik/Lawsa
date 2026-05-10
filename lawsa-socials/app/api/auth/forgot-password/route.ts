import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/queries";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

function getBaseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:5000";
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await updateUser(user.id, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    });

    sendPasswordResetEmail(user.email, user.name, token, getBaseUrl(request)).catch(() => {});

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
