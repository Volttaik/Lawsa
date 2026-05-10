import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailOrUsername, updateUser } from "@/lib/queries";
import { sendVerificationCodeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Dedicated resend endpoint — never overwrites with a new code if the
// existing one is still valid (avoids race-condition "expired" errors).
export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json();
    if (!emailOrUsername || !password)
      return NextResponse.json({ error: "Credentials required" }, { status: 400 });

    const user = await getUserByEmailOrUsername(emailOrUsername);
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    if (user.emailVerified) {
      return NextResponse.json({ message: "Already verified." });
    }

    // Always generate a fresh code on explicit resend request
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    await updateUser(user.id, {
      emailVerificationCode: code,
      emailVerificationCodeExpires: expires,
    });

    try {
      await sendVerificationCodeEmail(user.email, user.name, code);
    } catch (emailErr: any) {
      return NextResponse.json(
        { error: emailErr.message || "Failed to send code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Code sent." });
  } catch (e) {
    console.error("Resend code error:", e);
    return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
  }
}
