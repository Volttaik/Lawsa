import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/queries";
import { sendVerificationCodeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await getUserById(authUser.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.emailVerified) {
      return NextResponse.json({ message: "Already verified." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

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
    console.error("Send code error:", e);
    return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
  }
}
