import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByResetToken, updateUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password)
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const user = await getUserByResetToken(token);
    if (!user) {
      return NextResponse.json({ error: "Reset link is invalid or has expired" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await updateUser(user.id, {
      password: hashed,
      passwordResetToken: "",
      passwordResetExpires: null,
    });

    return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
  } catch (e) {
    console.error("Reset password error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
